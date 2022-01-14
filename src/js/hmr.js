import Questions from "./question/Questions";
import Auth from "./auth/Auth";
import Maps from "./maps/Maps";

if (module) {
  if (module.hot) {
    module.hot.dispose(function (data) {
      console.log(data);
    });
    module.hot.accept(function (data) {
      console.log(data);
    });
  }
}

Questions.daysLimit = 1;

Questions.addQuestion({
  element: document.getElementById("question1"),
  name: "question1",
});

Questions.addQuestion({
  element: document.getElementById("question2"),
  name: "question2",
});

Questions.addQuestion({
  element: document.getElementById("question3"),
  name: "question3",
});

(async function signInWithGoogle() {
  const button = document.getElementById("google-sign-in");

  console.log(button);

  button.addEventListener("click", async function (event) {
    event.preventDefault();

    console.log(await Auth.Google.signIn());
  });
})();

(async function signInWithFacebook() {
  const button = document.getElementById("facebook-sign-in");

  console.log(button);

  button.addEventListener("click", async function (event) {
    event.preventDefault();

    console.log(await Auth.Facebook.signIn());
  });
})();

(async function signOut() {
  const button = document.getElementById("sign-out");

  button.addEventListener("click", async function (event) {
    event.preventDefault();

    console.log(await Auth.signOut());
  });
})();

function showCurrentUser(email) {
  const h1 = document.getElementById("current-user");

  h1.innerText = email;
}

function removeCurrentUser() {
  const h1 = document.getElementById("current-user");

  h1.innerText = "";
}

Auth.onSignIn((user) => showCurrentUser(user.email));
Auth.onSignOut(() => removeCurrentUser());

(async function () {
  console.log(await Questions.getAnswers());
})();

(async function () {
  Maps.onMapGeometryChange((area) => console.log(area));

  const button = document.getElementById("reset");
  button.addEventListener("click", () => Maps.reset());
})();

console.log("module.js");
