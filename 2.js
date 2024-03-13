import fetch from "node-fetch";

function getList() {
    return fetch(
        "http://192.168.1.101:4000/submit",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            token: '1232132132112312312'
          }),
        }
      )
        .then(
          (res) => {
            console.log(res);
          },
          (err) => {
            throw err;
          }
        );
}
getList()