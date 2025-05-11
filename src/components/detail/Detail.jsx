import { auth, db } from "../../lib/firebase"
import "./detail.css"
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";



const Detail = () => {
   
    const {chatId, user,isCurrentUserBlocked,isReceiverBlocked,changeBlock} = useChatStore();

    const {currentUser} = useUserStore();

    const handleBlock = async() => {
        
        if(!user) return;

        const userDocRef = await doc(db, "users", currentUser.id);

        try {
            await updateDoc(userDocRef,{
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });

            changeBlock();
            
        } catch (err) {
            console.log(err);
            
        }
    }



    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"  } alt="" />
                <h4>{user?.username}</h4>
                <p>Lorem ipsum dolor sit amet..</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Caht Setting</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared photo</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg?t=st=1713719146~exp=1713722746~hmac=b0d1b434fddc5b40c059e36ed267354964e9b7c4efafaee7c0a17361ae3e3335&w=1060" alt="" />
                                <span>photo_2024_2.png</span>
                            </div>
                            <img src="/.download.png" alt="" className="icon" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img src="https://img.freepik.com/free-photo/colorful-design-with-spiral-design_188544-9588.jpg?t=st=1713719146~exp=1713722746~hmac=b0d1b434fddc5b40c059e36ed267354964e9b7c4efafaee7c0a17361ae3e3335&w=1060" alt="" />
                                <span>photo_2024_2.png</span>
                            </div>
                            <img src="/.download.png" alt="" className="icon" />
                        </div>
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <button onClick={handleBlock}>{
                    isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User blocked" : "Block User"
                }</button>
                <button className="logout" onClick={()=>auth.signOut()} >Logout</button>
            </div>
        </div>
    )
}

export default Detail