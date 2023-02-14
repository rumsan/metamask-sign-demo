import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";
const VERIFICATION_MESSAGE = "I am signing this message to prove that I own this address and I agree to particiapte in this Fellowship Program";

const signMessage = async ({ setError, message }) => {
    try {
        console.log({ message });
        if (!window.ethereum)
            throw new Error("No crypto wallet found. Please install it.");

        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log(signer);
        console.log({ message })
        const signature = await signer.signMessage(message);
        const address = await signer.getAddress();

        return {
            message,
            signature,
            address
        };
    } catch (err) {
        setError(err.message);
    }
};



const truncateFirstAndLast = (str) => {
    return str.slice(0, 6) + "..." + str.slice(-4);
};

export default function SignMessage() {
    const [error, setError] = useState();
    const [address, setAddress] = useState();
    const [verifiedAddress, setVerifiedAddress] = useState();

    const connectWallet = async () => {
        if (!window.ethereum) {
                alert("Please install Metamask");
                return;
            }
        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAddress(address);
        return address;
    };

    useEffect(() => {
        const accounts = async () => {
            if (!window.ethereum) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            if(!signer) return;
            const address = await signer.getAddress();
            console.log({ address });
            setAddress(address);
        };
        accounts();
    }, [])

    const handleSign = async (e) => {
        e.preventDefault();
        setError();
        const sig = await signMessage({
            setError,
            message: VERIFICATION_MESSAGE
        });
        if (sig) {
            setVerifiedAddress(address);
        }
    };

    return (
        <form className="m-4" onSubmit={handleSign}>
            <div className="credit-card w-full shadow-lg mx-auto rounded-xl bg-white">
                <main className="mt-4 p-4 mb-n4">
                    <h1 className="text-xl font-semibold text-gray-700 text-center">
                        {address ? (<div>
                            Sign message as &nbsp;
                            <a style={{color: "blue"}} href={`https://etherscan.io/address/${address}`} >{truncateFirstAndLast(address)}</a>
                        </div>
                            ) : "Sign message"}
                    </h1>
                    <div className="">
                        <div className="my-4">
                            <textarea
                                required
                                type="text"
                                name="message"
                                className="textarea w-full h-24 textarea-bordered focus:ring focus:outline-none"
                                placeholder="Message"
                                value={VERIFICATION_MESSAGE}
                                disabled
                            />
                        </div>
                    </div>
                </main>
                <footer className="p-4">
                    {address ? (
                        <button
                            type="submit"
                            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                        >
                            Sign message
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={connectWallet}
                            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                        >
                            Connect Wallet
                        </button>
                    )}
                    <ErrorMessage message={error} />
                    {verifiedAddress && <SuccessMessage message={`Successfully Signed Message as ${truncateFirstAndLast(verifiedAddress)}`} />}
                </footer>

            </div>
        </form>
    );
}
