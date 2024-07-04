// const baseUrl = "http://127.0.0.1:5000";
const baseUrl = "https://wisdomweaverdevapi.azurewebsites.net";
let txt = "";
let i = 0;
let speed = 1;
let uid = "";
let role = "";
let modelTypeValue = 1;
let source = "";
let mediaRecorder;
let audioChunks = [];
let uploadFilename = "";
let transcribedText = "";
let summarizedText = "";
let didGender = "female";
let dk = "";
let du = "";
let uniqueSessionId = "";
let chatType = "";

const initChatPrompt = {
  role: "system",
  content:
    "I want you to act as a offboarding knowledge management buddy, \
  where you ask me questions and you learn from my answers. \
  User is offboarding from Innostrat. \
  As short questions, one question at a time to user and capture as much knowledge as \
  possible from the user experience in organization. Ask one liner questions.",
};
let chatdict = [initChatPrompt];
let did_img =
  "https://create-images-results.d-id.com/api_docs/assets/noelle.jpeg";
let chatdictKS = [];

$(document).ready(function () {
  if (localStorage.getItem("token") != null) {
    role = localStorage.getItem("role");
    if (role.toLowerCase().indexOf("user") >= 0) {
      $(document).prop("title", "Innostrat AI - User");
      $(".adminrole").hide();
    } else {
      $(document).prop("title", "Innostrat AI - Admin");
      $(".adminrole").show();
    }
    $("#navigation").show();
    $("#landing_page").show();

    $("#login").hide();
    $("#train-model").hide();
    $("#model-audio").hide();
    $("#model-pdf").hide();
    $("#chat").hide();
    $("#chat-video").hide();
    $("#options_page").hide();
    $("#choose_avatar").hide();
    $("#knowledge_source").hide();
    initialize();
  } else {
    $("#train-model").hide();
    $("#navigation").hide();
    $("#model-audio").hide();
    $("#model-pdf").hide();
    $("#chat").hide();
    $("#chat-video").hide();
    $("#landing_page").hide();
    $("#options_page").hide();
    $("#choose_avatar").hide();
    $("#knowledge_source").hide();
    $("#login").show();
  }
  $("#chat-video-text-section").hide();
  $(".dot-flashing").hide();

  $("#question").keypress(function (e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      $("#send-button").trigger("click");
    }
  });
  //signIn();

  //Use this for development
  $("#login").hide();
  $("#landing_page").hide();
  $("#chat").show();
  // $("#chat-video").show();
  // playIdleVideo();
});

function getToken() {
  return localStorage.getItem("token");
}

function initialize() {
  const data = {};

  $.ajax({
    url: `${baseUrl}/initialize`,
    type: "POST",
    data: JSON.stringify(data),
    headers: {
      token: getToken(),
    },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data, text) {
      console.log("initialize", data);
      dk = data.dk;
      du = data.du;
    },
    error: function (request, status, error) {
      alert("Error in initialize");
    },
  });
}

function signIn() {
  const data = {
    email: $("#floatingInput").val(),
    code: $("#floatingPassword").val(),
  };
  $.blockUI();
  $.ajax({
    url: `${baseUrl}/login`,
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data, text) {
      $.unblockUI();
      if (data.error && data.error.length > 0) {
        alert("Username/Password incorrect");
      } else {
        role = data.role;
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        if (role.toLowerCase().indexOf("user") >= 0) {
          $(document).prop("title", "Innostrat AI - User");
          $(".adminrole").hide();
        } else {
          $(document).prop("title", "Innostrat AI - Admin");
          $(".adminrole").show();
        }
        $("#navigation").show();
        $("#landing_page").show();
        $("#login").hide();
        initialize();
      }
    },
    error: function (request, status, error) {
      $.unblockUI();
      alert(request.responseText);
    },
  });
}

function logout() {
  destroy();
  resetChat();
  resetChatVideo();
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  $("#chat").hide();
  $("#chat-video").hide();
  $("#train-model").hide();
  $("#navigation").hide();
  $("#model-audio").hide();
  $("#model-pdf").hide();
  $("#landing_page").hide();
  $("#options_page").hide();
  $("#choose_avatar").hide();
  $("#knowledge_source").hide();

  // $("#chat").show();
  // $("#login").hide();
  $(".dot-flashing").hide();

  $("#question").keypress(function (e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      $("#send-button").trigger("click");
    }
  });
  $("#login").show();
}

function landing_page_click() {
  $("#landing_page").hide();
  $("#options_page").show();
}

function options_page_click(option) {
  $("#options_page").hide();
  if (option == "offboarding") {
    chatType = "Offboarding";
    $("#choose_avatar").show();
  } else {
    chatType = "KnowledgeSource";
    uniqueSessionId = Date.now();
    $("#knowledge_source").show();
  }
}

async function choose_avatar_page_click(gender) {
  uniqueSessionId = Date.now();
  didGender = gender;
  $("#chat-video").show();

  $("#choose_avatar").hide();
  $("#stop-recording").hide();
  $.blockUI();
  // await connect();
  // await initChat();
  playIdleVideo();
  $.unblockUI();
}

function startTextChat() {
  uniqueSessionId = Date.now();
  $("#chat").show();
  $("#choose_avatar").hide();
  uid = Date.now();
  const answerHtml = `
        <div class="container-chatgpt">
          <img src="images/chatgpt.png" alt="ChatGPT Avatar" class="user-avatar" />
          <p class="pt-2 text gptanswer${uid}"></p>
        </div>
        `;
  $(".answers").append(answerHtml);

  txt = "What is your name?";
  i = 0;
  typeWriter();
}

function endSession() {
  home();
}

function home() {
  destroy();
  $("#navigation").show();
  $("#landing_page").show();

  $("#login").hide();
  $("#train-model").hide();
  $("#model-audio").hide();
  $("#model-pdf").hide();
  $("#chat-video").hide();
  $("#chat").hide();
  $("#options_page").hide();
  $("#choose_avatar").hide();
  $("#knowledge_source").hide();
  resetChat();
  resetChatVideo();
}

function trainModel() {
  $("#chat-video").hide();
  $(".form-select").val("1").trigger("change");
  $("#landing_page").hide();

  $("#train-model").show();
  $("#model-audio").hide();
  $("#model-pdf").hide();
  $("#chat-video").hide();
  $("#options_page").hide();
  $("#choose_avatar").hide();
  $("#knowledge_source").hide();
  resetVariables();
}

function sendMessage() {
  if ($("#question").val().trim().length == 0) return;
  chatdict.push({ role: "user", content: $("#question").val().trim() });
  const data = {
    query: chatdict,
    sessionId: uniqueSessionId,
    chatType: chatType,
  };
  const questionHtml = `<div class="container-user">
          <img src="images/avatar.png" alt="Avatar" class="user-avatar" />
          <p class="pt-2 text">${$("#question").val()}</p>
        </div>`;
  $(".answers").append(questionHtml);
  $(".answers").animate({ scrollTop: $(".answers")[0].scrollHeight }, 1000);
  $("#question").val("");
  $(".dot-flashing").show();
  $("#send-button").hide();
  $.ajax({
    url: `${baseUrl}/chatbot`,
    type: "POST",
    data: JSON.stringify(data),
    headers: {
      token: getToken(),
    },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data, text) {
      $.unblockUI();

      if (data.error && data.error.length > 0) {
        alert(data.error);
      } else {
        uid = Date.now();
        const answerHtml = `
        <div class="container-chatgpt">
          <img src="images/chatgpt.png" alt="ChatGPT Avatar" class="user-avatar" />
          <p class="pt-2 text gptanswer${uid}"></p>
        </div>
        `;
        $(".answers").append(answerHtml);

        txt = data.content;
        chatdict.push(data);
        i = 0;
        typeWriter();
      }
    },
    error: function (request, status, error) {
      $.unblockUI();
      alert(request.responseText);
    },
  });
}

function sendMessageKS() {
  if ($("#question_ks").val().trim().length == 0) return;
  chatdictKS.push({ role: "user", content: $("#question_ks").val().trim() });
  const data = {
    query: $("#question_ks").val().trim(),
    chatdictKS: chatdictKS,
    sessionId: uniqueSessionId,
    chatType: chatType,
  };
  const questionHtml = `<div class="container-user">
          <img src="images/avatar.png" alt="Avatar" class="user-avatar" />
          <p class="pt-2 text">${$("#question_ks").val()}</p>
        </div>`;
  $(".answer_ks").append(questionHtml);
  $(".answer_ks").animate({ scrollTop: $(".answer_ks")[0].scrollHeight }, 1000);
  $("#question_ks").val("");
  $(".dot-flashing").show();
  $(".send-button-ks").hide();
  // $(".send-button-ks").addClass("disabled");

  $.ajax({
    url: `${baseUrl}/knowledgeSource`,
    type: "POST",
    data: JSON.stringify(data),
    headers: {
      token: getToken(),
    },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data, text) {
      $.unblockUI();

      if (data.error.length > 0) {
        alert(data.error);
      } else {
        uid = Date.now();
        const answerHtml = `
        <div class="container-chatgpt">
          <img src="images/chatgpt.png" alt="ChatGPT Avatar" class="user-avatar" />
          <p class="pt-2 text gptanswer${uid}"></p>
          <p class="pt-2 source_ks${uid}"></p>
        </div>
        `;
        $(".answer_ks").append(answerHtml);
        txt = data.answer;
        chatdict.push({ role: "system", content: data.answer });
        i = 0;
        typeWriter();
        source = data.source;
        // $(".send-button-ks").removeClass("disabled");
        // $(".source_ks").html("Source: "+data.source)
      }
    },
    error: function (request, status, error) {
      $.unblockUI();
      alert(request.responseText);
    },
  });
}
function resetChat() {
  console.log("clicked");
  $(".answers").empty();
  chatdict = [initChatPrompt];
  chatdictKS = [];
  $(".answer_ks").empty();
}

function initChat() {
  talk("What is your name?");
}

function sendMessageVideo() {
  if ($("#question-video").val().trim().length == 0) return;
  chatdict.push({ role: "user", content: $("#question-video").val().trim() });
  const data = {
    query: chatdict,
    sessionId: uniqueSessionId,
    chatType: chatType,
  };
  const questionHtml = `<div class="container-user">
          <img src="images/avatar.png" alt="Avatar" class="user-avatar" />
          <p class="pt-2 text">${$("#question-video").val()}</p>
        </div>`;
  $(".answers-video").append(questionHtml);
  $(".answers-video").animate(
    { scrollTop: $(".answers-video")[0].scrollHeight },
    1000
  );
  $("#question-video").val("");
  $(".dot-flashing").show();
  $("#section-question-video").block({
    message: "<h4>Loading...</h4>",
    css: { border: "3px solid gray" },
  });
  $("#start-recording").attr("disabled", "disabled");
  $("#start-recording").text("Processing...");
  $("#send-button").hide();
  $.ajax({
    url: `${baseUrl}/chatbot`,
    type: "POST",
    data: JSON.stringify(data),
    headers: {
      token: getToken(),
    },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: async function (data, text) {
      $.unblockUI();
      console.log("dataaaaaaaaaaaa", data);
      if (data.error && data.error.length > 0) {
        alert(data.error);
      } else {
        $.unblockUI();
        chatdict.push({ role: "assistant", content: data.content });
        // $("#gptvideo").attr("src", data.video);
        await talk(data.content);
        $(".dot-flashing").hide();
        $("#send-button").show();

        uid = Date.now();
        const answerHtml = `
        <div class="container-chatgpt">
          <img src="images/chatgpt.png" alt="ChatGPT Avatar" class="user-avatar" />
          <p class="pt-2 text gptanswer${uid}"></p>
        </div>
        `;
        $(".answers-video").append(answerHtml);

        txt = data.content;
        // chatdict.push({ role: "assistant", content: data.content });
        i = 0;
        typeWriter();
        $(".dot-flashing").hide();
        $("#send-button").show();

        $("#section-question-video").unblock();
        $("#start-recording").removeAttr("disabled");
        $("#start-recording").text("Start Recording");
      }
    },
    error: function (request, status, error) {
      $.unblockUI();
      alert(request.responseText);
    },
  });
}

function resetChatVideo() {
  $("#gptvideo").attr("src", "#");
  console.log("clicked");
  $(".answers").empty();
  $(".answers-video").empty();
  $(".answer_ks").empty();
  chatdict = [initChatPrompt];
  chatdictKS = [];
}

function typeWriter() {
  if (i < txt.length) {
    $(".answers").animate({ scrollTop: $(".answers")[0].scrollHeight }, 0);
    $(".answer_ks").animate({ scrollTop: $(".answer_ks")[0].scrollHeight }, 0);
    $(`.gptanswer${uid}`).html($(`.gptanswer${uid}`).html() + txt.charAt(i));
    i++;
    setTimeout(typeWriter, speed);
  } else {
    source = source.trim().replace("SOURCES:", "Unavailable");
    $(`.source_ks${uid}`).html("<strong>Knowledge source</strong>: " + source);
    $(".answers").animate({ scrollTop: $(".answers")[0].scrollHeight }, 0);
    $(".answer_ks").animate({ scrollTop: $(".answer_ks")[0].scrollHeight }, 0);
    $(".dot-flashing").hide();
    $("#send-button").show();
    $(".send-button-ks").show();
  }
}

function startRecordChat() {
  resetVariables();
  $("#start-recording").hide();
  $("#stop-recording").show();
  $("#audioPlayer").hide();
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = setAudioChat;
    mediaRecorder.start();
    document.querySelector('[onclick="stopRecordChat()"]').disabled = false;
    document.querySelector('[onclick="startRecordChat()"]').disabled = true;
  });
}
function stopRecordChat() {
  $("#start-recording").show();
  $("#stop-recording").hide();
  $("#audioPlayerChat").hide();
  mediaRecorder.stop();
  document.querySelector('[onclick="stopRecordChat()"]').disabled = true;
  document.querySelector('[onclick="startRecordChat()"]').disabled = false;
}

function setAudioChat() {
  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const audioURL = URL.createObjectURL(audioBlob);
  document.getElementById("audioPlayerChat").src = audioURL;
  uploadAudioChat();
}

function uploadAudioChat() {
  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const sizeInKilobytes = audioBlob.size / 1024;
  const sizeInMegabytes = sizeInKilobytes / 1024;
  if (sizeInMegabytes < 20) {
    $.blockUI({
      message: "<h1>Please wait, Processing recording..</h1>",
    });
    const formData = new FormData();
    formData.append("audio", audioBlob);

    fetch(`${baseUrl}/uploadAudioChat`, {
      method: "POST",
      body: formData,
      headers: {
        token: getToken(),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        $.unblockUI();
        if (data.error && data.error.length > 0) {
          alert("Error in uploading file. Try again later.");
        } else {
          console.log(data);
          $("#question-video").val(data.transcription);
          sendMessageVideo();
        }
      })
      .catch((error) => {
        $.unblockUI();
        console.error("Error uploading audio:", error);
        alert("Error uploading audio" + error);
      });
  } else {
    alert("Currently we support recorded audio of size less than 20 MB.");
  }
}
function askQueries() {
  $("#chat-video").show();
  $("#train-model").hide();
}

function resetVariables() {
  mediaRecorder = null;
  audioChunks = [];
  uploadFilename = "";
  transcribedText = "";
  summarizedText = "";
}

function startTraining() {
  if (
    modelTypeValue == 1 &&
    $("#model-text-source").val().trim().length === 0
  ) {
    alert("Please enter source value");
    return;
  }
  if (modelTypeValue == 1 && $("#model-text").val().trim().length === 0) {
    alert("Please enter text to train the language model");
    return;
  }
  if (modelTypeValue == 2 && $("#model-pdf").val().trim().length === 0) {
    alert("Please enter url of pdf to train the language model");
    return;
  }
  if (
    modelTypeValue == 2 &&
    ($("#model-pdf").val().trim().indexOf(".pdf") === -1 ||
      $("#model-pdf").val().trim().indexOf("http") === -1)
  ) {
    alert("Invalid pdf url");
    return;
  }

  $.blockUI({
    message: "<h1>Please wait, training AI language model...</h1>",
  });

  let data = {};
  let url = "";
  if (modelTypeValue == 1) {
    data = {
      trainText: $("#model-text").val().trim(),
      source: $("#model-text-source").val().trim(),
    };
    url = `${baseUrl}/trainModel`;
  } else if (modelTypeValue == 2) {
    data = {
      email: $("#floatingInput").val(),
      url: $("#model-pdf").val().trim(),
    };
    url = `${baseUrl}/trainModelPDF`;
  }

  $.ajax({
    url: url,
    type: "POST",
    data: JSON.stringify(data),
    headers: {
      token: getToken(),
    },
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data, text) {
      $.unblockUI();
      if (data.error && data.error.length > 0) {
        alert(data.error);
      } else {
        $("#model-text").val("");
        $("#model-text-source").val("");
        $("#model-pdf").val("");
        alert("New information ingested successfully!");
      }
    },
    error: function (request, status, error) {
      $.unblockUI();
      alert(request.responseText);
    },
  });
}

function typeChanged(obj) {
  modelTypeValue = parseInt($(obj).val(), 10);
  if (modelTypeValue === 1) {
    $("#model-pdf").hide();
    $("#model-audio").hide();
    $("#model-text").show();
    $("#model-text-source").show();
    $(".main-buttons").show();
  } else if (modelTypeValue == 2) {
    $("#model-text").hide();
    $("#model-text-source").hide();
    $("#model-audio").hide();
    $("#model-pdf").show();
    $(".main-buttons").show();
  } else if (modelTypeValue == 3) {
    $("#model-text").hide();
    $("#model-text-source").hide();
    $("#model-pdf").hide();
    $("#model-audio").show();
    $(".main-buttons").hide();
    $("#audioPlayer").hide();
  }
}

function startRecording() {
  resetVariables();
  $("#start-recording").hide();
  $("#audioPlayer").hide();
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = setAudio;
    mediaRecorder.start();
    document.querySelector('[onclick="stopRecording()"]').disabled = false;
    document.querySelector('[onclick="transcribe()"]').disabled = true;
    document.querySelector('[onclick="startRecording()"]').disabled = true;
    document.querySelector('[onclick="summarize()"]').disabled = true;
  });
}

function stopRecording() {
  $("#audioPlayer").hide();
  $("#start-recording").show();
  $("#stop-recording").hide();
  mediaRecorder.stop();
  document.querySelector('[onclick="stopRecording()"]').disabled = true;
  document.querySelector('[onclick="transcribe()"]').disabled = false;
  document.querySelector('[onclick="startRecording()"]').disabled = false;
  document.querySelector('[onclick="summarize()"]').disabled = true;
}

function setAudio() {
  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const audioURL = URL.createObjectURL(audioBlob);
  document.getElementById("audioPlayer").src = audioURL;
  upload();
}

function uploadFile() {
  const email = $("#floatingInput").val();
  const code = $("#floatingPassword").val();

  const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
  const sizeInKilobytes = audioBlob.size / 1024;
  const sizeInMegabytes = sizeInKilobytes / 1024;
  if (sizeInMegabytes < 20) {
    $.blockUI({
      message: "<h1>Please wait, Processing recording..</h1>",
    });
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("email", email);

    fetch(`${baseUrl}/uploadAudio`, {
      method: "POST",
      body: formData,
      headers: {
        token: getToken(),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        $.unblockUI();
        if (data.error && data.error.length > 0) {
          alert("Error in uploading file. Try again later.");
        } else {
          console.log(data);
          uploadFilename = data.filename;
          document.querySelector('[onclick="transcribe()"]').disabled = false;
          alert("Audio file processed successfully");
        }
      })
      .catch((error) => {
        $.unblockUI();
        console.error("Error uploading audio:", error);
        alert("Error uploading audio" + error);
      });
  } else {
    alert("Currently we support recorded audio of size less than 20 MB.");
  }
}

function transcribe() {
  if (transcribedText.length > 0) {
    $(".modal-title").text("Transcription");
    $("#modal-data").text(transcribedText);
    $("#modalText").modal("show");
  } else {
    const data = {
      email: $("#floatingInput").val(),
      filename: uploadFilename,
    };
    $.blockUI({
      message: "<h1>Please wait, Transcribing Text...</h1>",
    });
    $.ajax({
      url: `${baseUrl}/transcribe`,
      type: "POST",
      headers: {
        token: getToken(),
      },
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data, text) {
        $.unblockUI();
        if (data.error && data.error.length > 0) {
          alert(data.error);
        } else {
          console.log("transcribe successful");
          transcribedText = data.transcription;
          document.querySelector('[onclick="summarize()"]').disabled = false;
          $(".modal-title").text("Transcription");
          $("#modal-data").text(transcribedText);
          $("#modalText").modal("show");
          console.log("transcribedText", transcribedText);
        }
      },
      error: function (request, status, error) {
        $.unblockUI();
        alert(request.responseText);
      },
    });
  }
}

function summarize() {
  if (summarizedText.length > 0) {
    $(".modal-title").text("Summary");
    $("#modal-data").text(summarizedText);
    $("#modalText").modal("show");
  } else {
    const data = {
      email: $("#floatingInput").val(),
      transcription: transcribedText,
    };
    $.blockUI({
      message: "<h1>Please wait, Summarizing Text...</h1>",
    });
    $.ajax({
      url: `${baseUrl}/summarize`,
      type: "POST",
      headers: {
        token: getToken(),
      },
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data, text) {
        if (data.error && data.error.length > 0) {
          alert(data.error);
        } else {
          $.unblockUI();
          console.log("transcribe successful");
          summarizedText = data.summary;
          $(".modal-title").text("Summary");
          $("#modal-data").text(summarizedText);
          $("#modalText").modal("show");
          console.log("summarizedText", summarizedText);
        }
      },
      error: function (request, status, error) {
        $.unblockUI();
        alert(request.responseText);
      },
    });
  }
}

function closeModal() {
  $("#modalText").modal("hide");
}

function showHideChat() {
  $("#chat-video-text-section").toggle();
  if ($("#chat-video-text-section").css("display") === "none") {
    $(".avatar-section").removeClass("col-7");
    $(".avatar-section").addClass("col-12");
  } else {
    $(".avatar-section").removeClass("col-12");
    $(".avatar-section").addClass("col-7");
  }
}
