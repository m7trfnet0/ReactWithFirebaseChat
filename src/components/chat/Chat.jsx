import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import uploadAudio from "../../lib/uploadAudio";
import { ReactMic } from "react-mic";
uploadAudio
const Chat = () => {
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file: null,
        url: "",
    });
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState("");
    const [audioBlob, setAudioBlob] = useState(null); // State to hold the audio blob

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current.scrollIntoView({ behavior: "smooth" });
    }, [chat?.messages]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });
        return () => {
            unSub();
        }
    }, [chatId]);

    console.log(chat)

    const handeleEmoji = e => {
        setText((perv) => perv + e.emoji);
        setOpen(false);
    }

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handlSend = async () => {
        if (text === "") return;
        let imgUrl = null;
        let audioUrl = null;

        try {
            if (img.file) {
                imgUrl = await upload(img.file);
            }
            if (audioBlob) {
                audioUrl = await uploadAudio(audioBlob); 
            }


            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createAt: new Date(),
                    ...(imgUrl && { img: imgUrl }),
                    ...(audioUrl && { audio: audioUrl }),
                })
            });
            setAudioUrl(""); 
            setAudioBlob(null);
            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex((chat) => chat.chatId === chatId);
                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats
                    });
                }
            });

        } catch (e) {
            console.error(e);
        }

        setImg({
            file: null,
            url: ""
        })

        setText("");
    }

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="avatar" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor, sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={message.senderId === currentUser.id ? "message won" : "message"} key={message?.createAt}>
                        <div className="texts">

                            {message?.img && <img src={message.img} alt="" />}
                            {message?.audio && <audio controls ><source src={message.audio} type="audio/wav" /></audio>}
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}

                {img.url && (
                    <div className="message won">
                        <div className="texts">
                            <img src={img.url} alt="" />
                        </div>
                    </div>
                )}

                {audioUrl && (
                    <div className="message won">
                        <div className="texts">
                            <audio controls>
                                <source src={audioUrl} type="audio/wav" />
                            </audio>
                        </div>
                    </div>
                )}


                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="" />
                        <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
                    </label>
                    <img src="./camera.png" alt="" />
                    <ReactMic
                        record={isRecording}
                        className="react-mic"
                        onStop={(blobObject) => {
                            setAudioUrl(blobObject.blobURL);
                            setAudioBlob(blobObject.blob);
                        }}
                    />

                    <img
                        src={isRecording ? "./mic-red.png" : "./mic.png"}
                        alt=""
                        onClick={() => setIsRecording((prev) => !prev)}
                    />
                </div>
                <input type="text"
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You can't send a message" : "Type a message..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img src="./emoji.png"
                        alt=""
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handeleEmoji} />
                    </div>
                </div>
                <button className="sendButton" onClick={handlSend}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}>
                    Send
                </button>
            </div>
        </div>
    )
}

export default Chat;