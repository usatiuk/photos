import { User } from "entity/User";
//import { Document } from "~entity/Document";

export interface ISeed {
    user1: User;
    user2: User;
    // doc1: Document;
    // doc2p: Document;
}

export async function seedDB(): Promise<ISeed> {
    //await Document.remove(await Document.find());
    await User.remove(await User.find());

    const user1 = new User("User1", "user1@users.com");
    await user1.setPassword("User1");
    await user1.save();

    const user2 = new User("User2", "user2@users.com");
    await user2.setPassword("User2");
    await user2.save();

    //const doc1 = new Document(user1, "Doc1", "Doc1", false);
    //const doc2p = new Document(user1, "Doc2", "Doc2", true);

    //await doc1.save();
    //await doc2p.save();

    return { user1, user2 }; // doc1, doc2p };
}
