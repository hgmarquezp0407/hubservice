"use client"
import Link from 'next/link';
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import { ThemeChanger } from '@/redux/action';
import store from '@/redux/store';
import { connect } from 'react-redux';
import SimpleBar from "simplebar-react";
import SpkBadge from '@/app/components/@spk-reusable/reusable-uielements/spk-badge';
import SpkDropdown from '@/app/components/@spk-reusable/reusable-uielements/spk-dropdown';
import { useAuth } from '@/app/contexts/AuthContext';

const Header = ({ local_varaiable, ThemeChanger }: any) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("❌ Error en handleLogout:", error);
    }
  };

  //full screen
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (
      !document.fullscreenElement &&
      !document.fullscreenElement &&
      !document.fullscreenElement
    ) {
      // Enter fullscreen mode
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);

    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
    };
  }, []);

  //MenuClose

  function menuClose() {
    const theme = store.getState().theme;
    if (window.innerWidth <= 992) {
      ThemeChanger({ ...theme, toggled: "close" });
    }
    if (window.innerWidth >= 992) {
      ThemeChanger({ ...theme, toggled: local_varaiable.toggled ? local_varaiable.toggled : '' });
    }
  }

  //Toggle-Function

  function toggleSidebar() {
    const theme = store.getState().theme;
    const sidemenuType = theme.dataNavLayout;
    if (window.innerWidth >= 992) {
      if (sidemenuType === "vertical") {
        const verticalStyle = theme.dataVerticalStyle;
        const navStyle = theme.dataNavStyle;
        switch (verticalStyle) {
          // closed
          case "closed":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.toggled === "close-menu-close") {
              ThemeChanger({ ...theme, "toggled": "" });
            } else {
              ThemeChanger({ ...theme, "toggled": "close-menu-close" });
            }
            break;
          // icon-overlay
          case "overlay":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.toggled === "icon-overlay-close") {
              ThemeChanger({ ...theme, "toggled": "", "iconOverlay": '' });
            } else {
              if (window.innerWidth >= 992) {
                ThemeChanger({ ...theme, "toggled": "icon-overlay-close", "iconOverlay": '' });
              }
            }
            break;
          // icon-text
          case "icontext":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.toggled === "icon-text-close") {
              ThemeChanger({ ...theme, "toggled": "" });
            } else {
              ThemeChanger({ ...theme, "toggled": "icon-text-close" });
            }
            break;
          // doublemenu
          case "doublemenu":
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            ThemeChanger({ ...theme, "dataNavStyle": "" });
            if (theme.toggled === "double-menu-open") {
              ThemeChanger({ ...theme, "toggled": "double-menu-close" });
            } else {
              const sidemenu = document.querySelector(".side-menu__item.active");
              if (sidemenu) {
                ThemeChanger({ ...theme, "toggled": "double-menu-open" });
                if (sidemenu.nextElementSibling) {
                  sidemenu.nextElementSibling.classList.add("double-menu-active");
                }
                else {

                  ThemeChanger({ ...theme, "toggled": "double-menu-close" });
                }
              }
            }
            break;
          // detached
          case "detached":
            if (theme.toggled === "detached-close") {
              ThemeChanger({ ...theme, "toggled": "", "iconOverlay": '' });
            } else {
              ThemeChanger({ ...theme, "toggled": "detached-close", "iconOverlay": '' });
            }

            break;

          // default
          case "default":
            ThemeChanger({ ...theme, "toggled": "" });
        }
        switch (navStyle) {
          case "menu-click":
            if (theme.toggled === "menu-click-closed") {
              ThemeChanger({ ...theme, "toggled": "" });
            }
            else {
              ThemeChanger({ ...theme, "toggled": "menu-click-closed" });
            }
            break;
          // icon-overlay
          case "menu-hover":
            if (theme.toggled === "menu-hover-closed") {
              ThemeChanger({ ...theme, "toggled": "" });
            } else {
              ThemeChanger({ ...theme, "toggled": "menu-hover-closed" });

            }
            break;
          case "icon-click":
            if (theme.toggled === "icon-click-closed") {
              ThemeChanger({ ...theme, "toggled": "" });
            } else {
              ThemeChanger({ ...theme, "toggled": "icon-click-closed" });

            }
            break;
          case "icon-hover":
            if (theme.toggled === "icon-hover-closed") {
              ThemeChanger({ ...theme, "toggled": "" });
            } else {
              ThemeChanger({ ...theme, "toggled": "icon-hover-closed" });

            }
            break;

        }
      }
    }
    else {
      if (theme.toggled === "close") {
        ThemeChanger({ ...theme, "toggled": "open" });

        setTimeout(() => {
          if (theme.toggled == "open") {
            const overlay = document.querySelector("#responsive-overlay");

            if (overlay) {
              overlay.classList.add("active");
              overlay.addEventListener("click", () => {
                const overlay = document.querySelector("#responsive-overlay");

                if (overlay) {
                  overlay.classList.remove("active");
                  menuClose();
                }
              });
            }
          }

          window.addEventListener("resize", () => {
            if (window.screen.width >= 992) {
              const overlay = document.querySelector("#responsive-overlay");

              if (overlay) {
                overlay.classList.remove("active");
              }
            }
          });
        }, 100);
      } else {
        ThemeChanger({ ...theme, "toggled": "close" });
      }
    }



  };

  //Dark Model

  const toggledark = () => {

    ThemeChanger({
      ...local_varaiable,
      "dataThemeMode": local_varaiable.dataThemeMode == 'dark' ? 'light' : 'dark',
      "dataHeaderStyles": local_varaiable.dataThemeMode == 'dark' ? 'light' : 'dark',
      "dataMenuStyles": local_varaiable.dataNavLayout == 'horizontal' ? local_varaiable.dataThemeMode == 'dark' ? 'light' : 'dark' : "dark"

    });
    const theme = store.getState().theme;

    if (theme.dataThemeMode != 'dark') {

      ThemeChanger({
        ...theme,
        "bodyBg": '',
        "lightRgb": '',
        "bodyBg2": '',
        "inputBorder": '',
        "formControlBg": '',
        "gray": '',
      });
      localStorage.setItem("xintralighttheme", "light");
      localStorage.removeItem("xintradarktheme");
      localStorage.removeItem("xintraMenu");
      localStorage.removeItem("xintraHeader");
    }
    else {
      localStorage.setItem("xintradarktheme", "dark");
      localStorage.removeItem("xintralighttheme");
      localStorage.removeItem("xintraMenu");
      localStorage.removeItem("xintraHeader");
    }

  };

  //Search Functionality

  const searchRef = useRef(null);

  const handleClick = (event: { target: any; }) => {
    const searchInput: any = searchRef.current;

    if (searchInput && (searchInput === event.target || searchInput.contains(event.target))) {
      document.querySelector(".header-search")?.classList.add("searchdrop");
    } else {
      document.querySelector(".header-search")?.classList.remove("searchdrop");
    }
  };

  useEffect(() => {
    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, []);

  //Switcher-Icon

  const Switchericon = () => {
    document.querySelector(".offcanvas-end")?.classList.toggle("show");
    if (document.querySelector(".switcher-backdrop")?.classList.contains("d-none")) {
      document.querySelector(".switcher-backdrop")?.classList.add("d-block");
      document.querySelector(".switcher-backdrop")?.classList.remove("d-none");
    }
  };

  useEffect(() => {
    const clickHandler = (_event: any) => {
      const searchResult = document.querySelector(".search-result");
      if (searchResult) {
        searchResult.classList.add("d-none");
      }
    };

    document.addEventListener("click", clickHandler);

    return () => {
      // Clean up the event listener when the component unmounts
      document.removeEventListener("click", clickHandler);
    };
  }, []);

  //Responsive Search
  const [show, setShow] = useState(false);

  // const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  //Notification
  const img = <span className="avatar avatar-md avatar-rounded bg-primary"> <img src="/assets/images/faces/1.jpg" alt="user1" /> </span>

  const content = <div className="text-muted fw-normal fs-12 header-notification-text text-truncate">Jane Sam sent you a message.</div>

  const Notifications = [
    { id: 1, src: img, heading: "New Messages", data: content, data1: "Now" },
  ]

  const [notifications, setNotifications] = useState(Notifications); // assuming 'data' is an array of notifications
  const [unreadCount, setUnreadCount] = useState(5); // initial unread count

  const hasNotifications = notifications.length > 0;

  const handleRemove1 = (id: number) => {
    // Filter out the notification by id
    const updatedNotifications = notifications.filter((notification) => notification.id !== id);
    setNotifications(updatedNotifications);
    setUnreadCount(unreadCount - 1); // decrease unread count
  };

  return (
    <Fragment>
      <header className="app-header sticky" id="header">
        <div className="main-header-container container-fluid">
          <div className="header-content-left">

            <div className="header-element">
              <div className="horizontal-logo">
                <Link href="/panel/home" className="header-logo">
                  <img src="/assets/images/brand-logos/desktop-logo.png" alt="logo" className="desktop-logo" />
                  <img src="/assets/images/brand-logos/toggle-dark.png" alt="logo" className="toggle-dark" />
                  <img src="/assets/images/brand-logos/desktop-dark.png" alt="logo" className="desktop-dark" />
                  <img src="/assets/images/brand-logos/toggle-logo.png" alt="logo" className="toggle-logo" />
                  <img src="/assets/images/brand-logos/toggle-white.png" alt="logo" className="toggle-white" />
                  <img src="/assets/images/brand-logos/desktop-white.png" alt="logo" className="desktop-white" />
                </Link>
              </div>
            </div>

            <div className="header-element mx-lg-0 mx-2">
              <Link aria-label="Hide Sidebar" onClick={() => toggleSidebar()} className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle" data-bs-toggle="sidebar" scroll={false} href="#!"><span></span></Link>
            </div>
          </div>

          <ul className="header-content-right">

            <li className="header-element d-md-none d-block">
              <Link href="#!" scroll={false} className="header-link" onClick={handleShow}>
                <i className="bi bi-search header-link-icon lh-1"></i>
              </Link>
            </li>

            <li className="header-element header-theme-mode" >
              <Link href="#!" scroll={false} className="header-link layout-setting" onClick={() => toggledark()}>

                <span className="light-layout">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 header-link-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                  </svg>
                </span>

                <span className="dark-layout">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 header-link-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                </span>
              </Link>
            </li>

            {/* <SpkDropdown Togglevariant='' Customtoggleclass='header-link no-caret' Customclass="header-element notifications-dropdown d-xl-block d-none" Navigate='#!' Id='messageDropdown' Svg={true} SvgClass='w-6 h-6 header-link-icon' Badgetag={true} Badgecolor='primary2' Badgeclass='header-icon-pulse rounded pulse pulse-secondary custom-header-icon-pulse' Menuclass='main-header-dropdown dropdown-menu-end'
              Svgicon='M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5' >
              <div className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="mb-0 fs-15 fw-medium">Notificaciones</p>
                  <SpkBadge variant='secondary' Customclass="text-fixed-white" Id="notification-data">
                    {unreadCount} Sin leer
                  </SpkBadge>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <SimpleBar className="list-unstyled mb-0" id="header-notification-scroll">
                {hasNotifications ? (
                  notifications.map((notification) => (
                    <li className='dropdown-item' key={notification.id}>
                      <div className="d-flex align-items-center">
                        <div className="pe-2 lh-1">
                          {notification.src}
                        </div>
                        <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                          <div>
                            <p className="mb-0 fw-medium"><Link href="/pages/chat">{notification.heading}</Link></p>
                            {notification.data}
                            <div className="fw-normal fs-10 text-muted op-8">{notification.data1}</div>
                          </div>
                          <div>
                            <Link href="#!" scroll={false} className="min-w-fit-content dropdown-item-close1" onClick={() => handleRemove1(notification.id)}>
                              <i className="ri-close-line"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="p-5 empty-item1">
                    <div className="text-center">
                      <span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
                        <i className="ri-notification-off-line fs-2"></i>
                      </span>
                      <h6 className="fw-medium mt-3">No hay nuevas notificaciones</h6>
                    </div>
                  </div>
                )}
              </SimpleBar>

              {hasNotifications && (
                <div className="p-3 empty-header-item1 border-top">
                  <div className="d-grid">
                    <Link href="#!" className="btn btn-primary btn-wave">Ver Todo</Link>
                  </div>
                </div>
              )}
            </SpkDropdown> */}

            <li className="header-element header-fullscreen">
              <Link href="#!" className="header-link" onClick={toggleFullscreen}>
                {isFullscreen ? (

                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 full-screen-close header-link-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 full-screen-open header-link-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </Link>
            </li>

            <SpkDropdown Customclass="header-element" toggleas="a" Navigate='#!' Customtoggleclass='header-link no-caret' Id="mainHeaderProfile" Imagetag={true}
              Imageclass='d-flex align-items-center avatar avatar-sm' Imagesrc="/assets/images/faces/15.jpg"
              Menuclass='main-header-dropdown pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end' Menulabel='mainHeaderProfile'>
              <Dropdown.Item className="text-center border-bottom">
                <div>
                  <span>
                    { user?.first_name } { user?.last_name }
                  </span> 
                  <span className="d-block fs-12 text-muted">{ user?.role }</span>
                </div>
              </Dropdown.Item>
              {/* <li>
                <Link className="dropdown-item d-flex align-items-center" href="/admin/profile">
                  <i className="fe fe-user p-1 rounded-circle bg-primary-transparent me-2 fs-16"></i>Perfil
                </Link>
              </li> */}
              <li>
                <Link className="dropdown-item d-flex align-items-center" href="/" onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}>
                  <i className="fe fe-lock p-1 rounded-circle bg-primary-transparent ut me-2 fs-16"></i>Cerrar Sesión
                </Link>
              </li>
            </SpkDropdown>

            <li className="header-element">
              <Link href="#!" scroll={false} className="header-link switcher-icon" data-bs-toggle="offcanvas" data-bs-target="#switcher-canvas" onClick={() => Switchericon()}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 header-link-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </Link>
            </li>
          </ul>
        </div>
      </header>
    </Fragment>
  )
}

const mapStateToProps = (state: any) => ({
  local_varaiable: state.theme
});
export default connect(mapStateToProps, { ThemeChanger })(Header);