//Mqtt
let mqtt;
let reconnectTimeout = 2000;
let host = "broker.hivemq.com";
let port = 8000;

function onConnect() {
  console.log("Conectado!");

  //Topicos para receber
  mqtt.subscribe("function/mqtt/js");

  ok = new Paho.MQTT.Message("1");
  ok.destinationName = "function/mqtt/confirm";
  ok.qos = 1;
  mqtt.send(ok);
}

function onError(message) {
  //Faz um log do erro
  console.log("Falha: " + message.errorCode + " " + message.errorMessage);

  //Reconecta ao broker
  setTimeout(MQTTConnect, reconnectTimeout);
}

function onMessageArrived(msg) {
  //Faz um log da mensagem recebida

  let ans = "";
  ans = msg.payloadString.split(" ");

  for (i = 0; i < ans.length; i++) {
    if (ans[i] != "") {
      if (ans[i].length == 1) ans[i] = parseFloat(ans[i]);
      if (typeof ans[i] == "string" && ans[i] % 2 != 0) {
        if (ans[i + 1] > 0) {
          const slides = document.querySelectorAll("#section2 .slide");
          for (x = 0; x < slides.length; x++) {
            if (slides[x].classList[1] == ans[i]) {
              console.log(slides[x].classList[1]);
              fullpage_api.moveTo(3, x);
            }
          }
        }
      }
    }
  }
}

function MQTTConnect() {
  console.log("Conectando " + host + ":" + port);

  //Cria e configura o client
  mqtt = new Paho.MQTT.Client(
    host,
    port,
    "FuncOrgJS" + parseInt(Math.random() * 1e5)
  );
  let options = {
    timeout: 10,
    keepAliveInterval: 10,
    onSuccess: onConnect,
    onFailure: onError,
  };

  //Return padrão
  mqtt.onMessageArrived = onMessageArrived;
  mqtt.onConnectionLost = onError;

  //Finalizando a conexão
  mqtt.connect(options);
}

//Imgur Sending
const file = document.getElementById("file");

file.addEventListener("change", (event) => {
  const formdata = new FormData();
  formdata.append("image", event.target.files[0]);
  fetch("https://api.imgur.com/3/image/", {
    method: "post",
    headers: {
      Authorization: "Client-ID 0ba5dfa1d3fe88a",
    },
    body: formdata,
  })
    .then((data) => data.json())
    .then((data) => {
      //Log de data
      console.log(data);

      //Mqtt msg
      imageInput = new Paho.MQTT.Message(`${data.data.link}`);
      imageInput.destinationName = "function/mqtt/python";
      imageInput.qos = 1;
      mqtt.send(imageInput);
    });
});

document
  .querySelector("#moveSectionDown")
  .addEventListener("click", function (e) {
    e.preventDefault();
    fullpage_api.moveSectionDown();
  });

//Conectando ao servidor Mqtt
window.onload = MQTTConnect();
