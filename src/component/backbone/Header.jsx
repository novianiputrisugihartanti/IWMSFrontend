import logo from "../../assets/IMG_Logo.png";
import Icon from "../part/Icon";
import "bootstrap-icons/font/bootstrap-icons.css";
import LastLoginDisplay from "../util/LastLoginDisplay";

export default function Header({ userInfo = null, isLandingPage = false, searchQuery, handleKeyUpSearch, handleSearch, handleToggleMenu, isHideSidebar }) {
  const path = window.location.pathname;
  return (
    <div className="d-flex justify-content-between fixed-top border-bottom bg-white align-items-center">
      <div className="d-flex align-items-center">
        <img
          src={logo}
          alt="Logo AstraTech"
          className="p-3 d-none d-sm-block"
          style={{ height: "70px" }}
        />
         {!isLandingPage && (
          <button type="button" onClick={handleToggleMenu} className="toggle-menu btn btn-primary ms-3">
            {isHideSidebar ? <i className="bi bi-chevron-double-right"></i> : <i className="bi bi-chevron-double-left"></i>}
          </button>
        )}       
      </div>
      {isLandingPage ? (
        <div className="d-flex flex-grow-1 justify-content-end px-4 my-auto">
          <div className="d-flex gap-2">
            {userInfo !== null ? (
              <a href='/beranda' className="btn btn-primary fw-semibold rounded-capsul input-shadow-md px-4 text-nowrap">
                <span className="">Beranda</span>
              </a>
            ) : (
              <a href='/login' className="btn btn-primary fw-semibold rounded-capsul input-shadow-md px-4 text-nowrap">
                <i className="bi bi-person-fill"></i> <span className="mx-1">Masuk</span>
              </a>)}
          </div>
        </div>
      ) : (
        <AuthenticatedHeader userInfo={userInfo} />
      )}
    </div>
  );

  function AuthenticatedHeader({ userInfo }) {
    return (
      <div className="pe-4 my-auto">
        <div className="d-flex justify-content-end">
          <div className="text-end">
            <p className="fw-bold mx-0 my-0">
              {userInfo.nama} ({userInfo.peran})
            </p>
            <small className="text-body-secondary" style={{ fontSize: ".7em" }}>
              <LastLoginDisplay />
            </small>
          </div>
          <div className="my-auto ms-4 mt-2">
            <p className="h2 p-0 m-0">
              <Icon name="envelope" />
              <span
                className="badge rounded-pill bg-danger position-absolute top-0 end-0"
                style={{
                  fontSize: ".3em",
                  marginTop: "15px",
                  marginRight: "15px",
                }}
              >
                40
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

