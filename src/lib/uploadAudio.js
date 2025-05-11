import { getDownloadURL, uploadBytesResumable, ref } from "firebase/storage";
import { storage } from "./firebase";

const uploadAudio = async (audioBlob) => {
    const uniqueFilename = `${Date.now()}.mp3`;
    const storageRef = ref(storage, `audio/${uniqueFilename}`);

    const uploadTask = uploadBytesResumable(storageRef, audioBlob);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                if (snapshot.totalBytes) {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Audio Upload Progress:', progress + '%');
                } else {
                    console.log('Waiting for total bytes...'); // Informative message
                }
            },
            (error) => {
                reject("Something went wrong!" + error.code);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject("Error getting download URL: " + error);
                }
            }
        );
    });
};

export default uploadAudio;
