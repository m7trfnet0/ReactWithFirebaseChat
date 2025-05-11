import UserInfo from "./userinfo/UserInfo";
import ChatList from "./chatlist/ChatList";
import "./list.css";



const List = () => {
    return(
        <div className="list">
            <UserInfo />
            <ChatList />
        </div>
    )
}

export default List