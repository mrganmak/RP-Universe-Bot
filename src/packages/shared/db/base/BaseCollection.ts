import type { Collection, Document, ObjectId, WithId } from "mongodb";
import { MongoDatabase } from "../mongo/MongoDatabase";

export class BaseCollection<TDoc extends Document> {
	private _collection: Collection<TDoc>;

	protected constructor(collectionName: string) {
		this._collection = MongoDatabase.database.collection<TDoc>(collectionName);
	}

	protected get collection(): Collection<TDoc> { return this._collection; }

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
