$(document).ready(function () {
  function login() {
    var enteredEmail = $("#typeEmail").val();
    var enteredPassword = $("#typePassword").val();

    if (
      enteredEmail === "admin@innostratai.com" &&
      enteredPassword === "Innostrat123!"
    ) {
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "index.html";
    } else {
      alert("Invalid email or password. Please try again.");
    }
  }

  $("#login").on("click", function (event) {
    event.preventDefault();
    login();
  });

  function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  }

  $("#logout").on("click", function (event) {
    event.preventDefault();
    logout();
  });

  var isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  var currentPage = window.location.pathname;

  if (currentPage.includes("login.html")) {
    if (isLoggedIn) {
      window.location.href = "index.html";
    }
  } else {
    if (!isLoggedIn) {
      window.location.href = "login.html";
    }
  }

  var projects = [
    {
      name: "Video script generator",
      link: "https://6d3c331f-1ab5-4528-8213-6bdc782f5d75.streamlit.app/",
      newTab: true,
      bgcolor: "rgb(254, 254, 254);",
      color: "rgb(0, 75, 132)",
    },
    {
      name: "e-Learning course generator",
      link: "https://93410d86-d326-430f-a3ea-c358e747852c.streamlit.app/",
      newTab: true,
      bgcolor: "#f974a6",
    },
    {
      name: "Multiple choice quiz generator",
      link: "https://de67e219-4f94-4875-b512-3bc32fa77f79.streamlit.app/",
      newTab: true,
      bgcolor: "rgb(254, 254, 254);",
      color: "rgb(0, 75, 132)",
    },
    {
      name: "Chat with multiple PDFs",
      link: "https://1ea12cb0-1862-4f02-a44d-558f3b21c0a7.streamlit.app/",
      newTab: true,
      bgcolor: "#79c9fa",
    },
    {
      name: "Generate summary from a video",
      link: "https://955562f0-df09-48e5-8484-38f6556f5105.streamlit.app/",
      newTab: true,
      bgcolor: "#79c9fa",
    },
    {
      name: "Generate summary from a pdf",
      link: "https://10195959-86ee-4bb0-afa1-2fe84a6def96.streamlit.app/",
      newTab: true,
      bgcolor: "rgb(254, 254, 254);",
      color: "rgb(0, 75, 132)",
    },
    {
      name: "Analyze a csv and ask questions",
      link: "https://476387fc-e81a-4b5d-a9ae-bd63bb71efcd.streamlit.app/",
      newTab: true,
      bgcolor: "#f974a6",
    },
    {
      name: "Sentiment analyzer",
      link: "https://2f1e49d2-04a6-4113-8578-7703c69a1dc8.streamlit.app/",
      newTab: true,
      bgcolor: "rgb(254, 254, 254);",
      color: "rgb(0, 75, 132)",
    },
  ];

  function generateCards() {
    var cardRow = $("#cardRow");

    projects.forEach(function (project) {
      var card = $('<div class="col-lg-3 col-md-4 col-sm-12 mb-4"></div>');
      var cardContent = `
              <div class="card custom-card-bg" style="background-color: ${
                project.bgcolor
              };">
                <a href="${project.link}" class="card-link text-white"  ${
        project.newTab ? 'target="_blank"' : ""
      }>
                  <div class="card-body">
                    <h5 class="card-title" style="color:${project.color}">${
        project.name
      }</h5>
                  </div>
                </a>
              </div>
            `;
      card.html(cardContent);
      cardRow.append(card);
    });
  }
  generateCards();
});
