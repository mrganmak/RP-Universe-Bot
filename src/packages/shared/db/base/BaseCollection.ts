import type { Collection, Document, WithId, OptionalUnlessRequiredId } from "mongodb";
import { MongoDatabase } from "@src/index.js";

export abstract class BaseCollection<TDoc extends Document> {
	private _collection: Collection<TDoc>;

	protected constructor(collectionName: string) {
		this._collection = MongoDatabase.database.collection<TDoc>(collectionName);
	}

	protected get collection(): Collection<TDoc> { return this._collection; }

	public async create(doc: OptionalUnlessRequiredId<TDoc>): Promise<BaseValue<TDoc>> {
		const standardKey = this._getStandartKey();

		//As any because: OptionalUnlessRequiredId<TDoc> has another keys besides the keys from keyof TDoc. 
		//So: we need to use as any in these keys because we don't need the '_id' key, from OptionalUnlessRequiredId<TDoc> but we can't use doc: TDoc, cause it will trigger a type error in this.collection.insertOne(doc);
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
		//As any is necessary in this case due to the peculiarities of generic typing in MongoDB.
		//Without it, a mismatch error will occur, despite the creation of a collection such as collection<TDoc>.
		await this.collection.deleteOne({ [key]: value } as any);
	}

	public async updateByKey<Key extends keyof WithId<TDoc>>(
		key: Key,
		value: WithId<TDoc>[Key],
		newDoc: TDoc,
	): Promise<void> {
		await this.collection.updateOne(
			//As any is necessary in this case due to the peculiarities of generic typing in MongoDB.
			//Without it, a mismatch error will occur, despite the creation of a collection such as collection<TDoc>.
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
		//As any in this case is necessary due to the peculiarities of generic typing in MongoDB.
		// According to the logic of this code, BaseValue, called exclusively within BaseCollection, has the same TDoc extends Document that is passed to it during creation.
		//At the same time, MongoDB considers these to be different classes due to the peculiarities of typing. 
		this._base.updateByKey('_id', this._doc._id as any, this.doc as any);

		return this;
	}

	public delete() {
		//As any in this case is necessary due to the peculiarities of generic typing in MongoDB.
		// According to the logic of this code, BaseValue, called exclusively within BaseCollection, has the same TDoc extends Document that is passed to it during creation.
		//At the same time, MongoDB considers these to be different classes due to the peculiarities of typing.
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
