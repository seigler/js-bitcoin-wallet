import { h } from "preact";
import style from "./style.css";
import localforage from "localforage";
import { signal, effect } from "@preact/signals";
import { pubkeyHash } from "../../utils/base58check";

const keyPair = signal(null);
const bytesFetched = signal(false);
const publicKeyString = signal(null);
effect(() => {
  if (keyPair.value && keyPair.value.publicKey) {
    window.crypto.subtle
      .exportKey("spki", keyPair.value.publicKey)
      .then(
        (value) => (publicKeyString.value = pubkeyHash(new Uint8Array(value)))
      );
  }
});

localforage
  .getItem("firstKey")
  .then((value) => {
    if (value !== null) {
      keyPair.value = value;
      console.info("Fetched an existing key");
    } else {
      console.info("No existing key found");
      window.crypto.subtle
        .generateKey(
          {
            name: "ECDSA",
            namedCurve: "P-256",
          },
          true,
          ["sign", "verify"]
        )
        .then((value) => {
          keyPair.value = value;
          localforage.setItem("firstKey", value).then(() => {
            console.info("Saved a new key");
          });
        });
    }
    bytesFetched.value = true;
  })
  .catch((err) => console.error(err));

const Home = () => {
  return (
    <div class={style.home}>
      <h1>Home</h1>
      <p>This is the Home component.</p>
      <p>Public key: {publicKeyString}</p>
    </div>
  );
};

export default Home;
