import { useState } from "react";
import { toast } from "react-toastify";
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs, serverTimestamp, setDoc, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";

import "./addUser.css";


const AddUser = () => {

    const [user, setUser] = useState(null);

    const { currentUser } = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');

        try {
            const userRef = collection(db, "users");

            const q = query(userRef, where("username", "==", username));

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            } else {
                toast.error("User not found");
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleAdd = async () => {
        try {
            const chatRef = collection(db, "chats");
            const userChatsRef = collection(db, "userchats");
            const userChatsDocRef = doc(userChatsRef, currentUser.id);
            const userChatsDocSnap = await getDoc(userChatsDocRef);
    
            const newChatRef = doc(chatRef);
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });
    
            if (!userChatsDocSnap.exists()) {
                await setDoc(doc(userChatsRef, user.id), {
                    chats: [{ chatId: newChatRef.id, lastMessage: "", receiverId: currentUser.id, updatedAt: Date.now() }]
                });
    
                await setDoc(doc(userChatsRef, currentUser.id), {
                    chats: [{ chatId: newChatRef.id, lastMessage: "", receiverId: user.id, updatedAt: Date.now() }]
                });
    
                toast.success("User added successfully");
            } else {
                const existingChats = userChatsDocSnap.data().chats;
                const userAlreadyAdded = existingChats.some(chat => chat.receiverId == user.id);
    
                if (userAlreadyAdded) {
                    toast.error("User already added");
                } else {
                    await setDoc(doc(userChatsRef, user.id), {
                        chats: arrayUnion({ chatId: newChatRef.id, lastMessage: "", receiverId: currentUser.id, updatedAt: Date.now() })
                    });
    
                    await updateDoc(doc(userChatsRef, currentUser.id), {
                        chats: arrayUnion({ chatId: newChatRef.id, lastMessage: "", receiverId: user.id, updatedAt: Date.now() })
                    });
    
                    toast.success("User added successfully");
                }
            }
        } catch (err) {
            console.error("Error adding user:", err);
            toast.error("Failed to add user");
        }
    };
    


    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="User Name" name="username" />
                <button >Search</button>
            </form>

            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add User</button>
            </div>}
        </div>

    );
};

export default AddUser;