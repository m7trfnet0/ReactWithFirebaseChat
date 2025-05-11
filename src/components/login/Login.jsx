import { useState } from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword ,signInWithEmailAndPassword} from "firebase/auth"; // Import createUserWithEmailAndPassword
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";
import "./login.css"



const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })

    const [loading, setLoading] = useState(false);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true);
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);
        try {
            if (!username || !email || !password) {
                return toast.error("Please fill in all fields")
            }
            if (password.length < 6) {
                return toast.error("Password must be at least 6 characters")
            }

            const res = await createUserWithEmailAndPassword(auth, email, password);

            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl || "./avatar.png",
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success("User created successfully !You can now login.");
        } catch (err) {
            console.log(err)
            toast.error(err.message);
        } finally {
            setLoading(false);
        }

    }

    const handleLogin = async(e) => {
        e.preventDefault()
        setLoading(true);

        const formData = new FormData(e.target);

        const {email, password } = Object.fromEntries(formData);

        try{
         await signInWithEmailAndPassword(auth, email, password);

        }catch(err){
            console.log(err);
            toast.error(err.message);
        }finally {
            setLoading(false);
        }

       // const email = e.target.email.value
      //  toast.success(`Welcome back ${email}`)
    }


    return (
        <div className="login">
            <div className="item">
                <h2>Welcome Back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separttor"></div>
            <div className="item">
                <h2>Creat an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an Image</label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder="User Name" name="username" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login