import "./styles.css";

export default function App() {
  return (
    <div className="loadingPageWrapper">
      <h1 className="title">Welcome to Abusive Chat app</h1>
      <div className="cardWrapper">
        <div className="cardButtonWrapper">
          <button className="oAuthButton">Login in with google</button>
        </div>
      </div>
    </div>
  );
}