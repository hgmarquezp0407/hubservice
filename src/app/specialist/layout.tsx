"use client";
import * as switcherdata from "@/data/switcherdata/switcherdata";
import { ThemeChanger } from "@/redux/action";
import React, { useEffect, useState, Fragment } from "react";
import { connect } from "react-redux";
import { useAuth } from "@/app/contexts/AuthContext";
import Footer from '@/app/components/layouts/footer/footer';
import Header from '@/app/components/layouts/header/header';
import SidebarSpecialist from '@/app/components/layouts/sidebar/sidebarSpecialist';
import Switcher from '@/app/components/layouts/switcher/switcher';
import Backtotop from '@/app/components/layouts/backtotop/backtotop';
import Loader from '@/app/components/layouts/loader/loader';

const AdminLayoutContent = ({ local_varaiable, ThemeChanger, children }: any) => {
    const [themeLoading, setThemeLoading] = useState(true);
    const [mounted, setMounted]           = useState(false);
    const { user, loading: authLoading, ready } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let callbackExecuted = false;

        switcherdata.LocalStorageBackup((themeValue: any) => {
            callbackExecuted = true;
            ThemeChanger(themeValue);
            setThemeLoading(false);
        });

        const timeout = setTimeout(() => {
            if (!callbackExecuted) setThemeLoading(false);
        }, 500);

        if (typeof window !== "undefined") {
            document.documentElement.setAttribute(
                "data-theme-mode",
                local_varaiable.dataThemeMode || "light"
            );
        }

        return () => clearTimeout(timeout);
    }, [ThemeChanger, local_varaiable.dataThemeMode]);

    // Redirigir solo cuando ready=true (fetchUser terminó) y no hay usuario
    useEffect(() => {
        if (ready && !authLoading && !user) {
            window.location.href = '/';
        }
    }, [ready, authLoading, user]);

    // Mostrar loader hasta que todo esté listo
    if (!mounted || themeLoading || !ready || authLoading) {
        return <Loader />;
    }

    if (!user?.id) {
        return null;
    }

    return (
        <Fragment>
            <Switcher />
            <div
                className="page"
                data-theme-mode={local_varaiable.dataThemeMode}
                data-header-styles={local_varaiable.dataHeaderStyles}
                data-vertical-style={local_varaiable.dataVerticalStyle}
                data-nav-layout={local_varaiable.dataNavLayout}
                data-menu-styles={local_varaiable.dataMenuStyles}
                data-toggled={local_varaiable.toggled}
                data-nav-style={local_varaiable.dataNavStyle}
                hor-style={local_varaiable.horStyle}
                data-page-style={local_varaiable.dataPageStyle}
                data-width={local_varaiable.dataWidth}
                data-menu-position={local_varaiable.dataMenuPosition}
                data-header-position={local_varaiable.dataHeaderPosition}
                data-icon-overlay={local_varaiable.iconOverlay}
                data-bg-img={local_varaiable.bgImg}
                icon-text={local_varaiable.iconText}
            >
                <Header user={user} />
                <SidebarSpecialist user={user} />
                <div className="main-content app-content">
                    <div className="container-fluid">
                        {children}
                    </div>
                </div>
                <Footer />
            </div>
            <Backtotop />
        </Fragment>
    );
};

const mapStateToProps = (state: any) => ({
    local_varaiable: state.theme,
});

export default connect(mapStateToProps, { ThemeChanger })(AdminLayoutContent);