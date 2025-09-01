import type { Collection, Document, ObjectId, WithId, OptionalUnlessRequiredId } from "mongodb";
import { MongoDatabase } from "../mongo/MongoDatabase";

export abstract class BaseCollection<TDoc extends Document> {
	private _collection: Collection<TDoc>;

	protected constructor(collectionName: string) {
		this._collection = MongoDatabase.database.collection<TDoc>(collectionName);
	}

	protected get collection(): Collection<TDoc> { return this._collection; }

	public async create(doc: OptionalUnlessRequiredId<TDoc>): Promise<BaseValue<TDoc>> {
		const standardKey = this._getStandartKey();
		const keyValue = (doc as any)[standardKey];
		if (keyValue !== undefined) {
			const isExists = await this.getByKey(standardKey as any, keyValue);
			if (isExists) throw new Error(`Document with ${String(standardKey)} ${keyValue} already exists`);
		} else {
			throw new Error(`${String(standardKey)} is standart key in ${this.collection.collectionName}. But not found in doc ${JSON.stringify(doc)}`);
		}
		
		const insertedDoc = await this.collection.insertOne(doc);
		const docWithId: WithId<TDoc> = {
			...doc,
			_id: insertedDoc.insertedId
		} as WithId<TDoc>;
		
		return new BaseValue(docWithId, this);
	}

	public async getByKey<Key extends keyof WithId<TDoc>>(key: Key, value: WithId<TDoc>[Key]): Promise<BaseValue<TDoc> | null> {
		const valueData = await this.collection.findOne({ [key]: value } as any);
		return (valueData ? new BaseValue(valueData, this) : null);
	}

	public async deleteByKey<Key extends keyof WithId<TDoc>>(key: Key, value: WithId<TDoc>[Key]): Promise<void> {
		await this.collection.deleteOne({ [key]: value } as any);
	}

	public async updateByKey<Key extends keyof WithId<TDoc>>(
		key: Key,
		value: WithId<TDoc>[Key],
		newDoc: TDoc,
	): Promise<void> {
		await this.collection.updateOne(
			{ [key]: value } as any,
			{ $set: newDoc },
			{ upsert: true }
		);
	}

	protected abstract _getStandartKey(): keyof TDoc;
}

export class BaseValue<TDoc extends Document> {
	constructor(
		private _doc: WithId<TDoc>,
		private _base: BaseCollection<TDoc>
	) {}

	public get doc(): WithId<TDoc> {
		return this._doc;
	}

	public set doc(newDoc: WithId<TDoc>) {
		newDoc._id = this._doc._id;
		this._doc = structuredClone(newDoc);
	}

	public update(): BaseValue<TDoc> {		
		this._base.updateByKey('_id', this._doc._id as any, this.doc as any);

		return this;
	}

	public delete() {
		this._base.deleteByKey('_id', this._doc._id as any);
	}

	public change<Key extends Exclude<keyof WithId<TDoc>, '_id'>>(
		key: Key,
		value: WithId<TDoc>[Key]
	): BaseValue<TDoc> {
		this.doc[key] = value;
		this.update();

		return this;
	}
}
