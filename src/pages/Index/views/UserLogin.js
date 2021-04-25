import "../scss/UserLogin.scss";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import basicRequest from "../../../apis/api";
import { open, close } from "../components/Spinner";
import { HashRouter as Router, Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/user";

function UserLogin() {
  const dispatch = useDispatch();

  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dirty, setDirty] = useState({ email: false, password: false });
  const [invalidForm, setInvalidForm] = useState({
    email: false,
    password: false,
  });

  useEffect(() => {
    dirty.email === false && setDirty({ ...dirty, email: true });
    dirty.password === false && setDirty({ ...dirty, password: true });
    validForm();
  }, [dirty, email, password, validForm]);

  function validForm() {
    let emailInvalid = false;
    let passwordInvalid = false;
    if (dirty.email === true) {
      const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      emailInvalid = !regex.test(email);
    }
    if (dirty.password === true) {
      const regex = /\w+/;
      passwordInvalid = !regex.test(password);
    }
    setInvalidForm({ email: emailInvalid, password: passwordInvalid });

    return !(invalidForm.email || invalidForm.password); // true=ok;false=ng
  }
  function clickLogin() {
    let isValid = validForm();
    if (isValid) {
      open();
      basicRequest
        .post("/login/", { email, password })
        .then((response) => {
          const token = "jwt " + response.data.token;
          const user = response.data.user;
          Swal.fire("嗨, " + user.first_name, "歡迎回來!", "success").then(
            () => {
              dispatch(login({ token, user }));
              history.push("/");
            }
          );
        })
        .catch(function (error) {
          const title = error.response.status.toString();
          const msg = JSON.stringify(error.response.data);
          Swal.fire(title, msg, "error");
          console.error(error);
        })
        .finally(() => {
          close();
        });
    }
  }
  function handleChange(event) {
    switch (event.target.name) {
      case "email":
        setEmail(event.target.value);
        break;
      case "password":
        setPassword(event.target.value);
        break;
      default:
        break;
    }
  }

  return (
    <div className="UserLogin">
      <div className="login container">
        <p>用電子郵件登入</p>
        <div className="form-group">
          <input
            name="email"
            type="text"
            className={`text-box ${invalidForm.email ? "is-invalid" : null}`}
            placeholder="電子信箱"
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            name="password"
            type="password"
            className={`text-box ${invalidForm.password ? "is-invalid" : null}`}
            placeholder="密碼"
            onChange={handleChange}
            onKeyPress={(event) => {
              event.key === "Enter" && clickLogin();
            }}
          />
        </div>
        <div className="form-group">
          <Router>
            <p>
              <Link to="/resetPassword">忘記密碼?</Link>
            </p>
          </Router>
        </div>
        <div className="button-box">
          <button className="btn blue" onClick={() => clickLogin()}>
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;