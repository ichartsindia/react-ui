import React, { Component } from 'react';
import { Menubar } from 'primereact/menubar';
import { InputText } from 'primereact/inputtext';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.min.css';
import 'primereact/menubar/menubar.min.css';
import './AppMenu.css';

import {useNavigate} from "react-router-dom";


const AppMenu = (props) => {
    const navigate = useNavigate();

     const   items = [
            {
                
                label: 'Options',
                icon: 'pi pi-fw pi-table',
                items: [
                    {
                        label: 'Strategy Builder',
                        command: () => {navigate('/strategyBuilder') },
                        icon: 'pi pi-fw pi-chart-bar',
                    },
                    {
                        label: 'Short ATM+/- 1%',
                        icon: 'pi pi-fw pi-minus'
                    },
                    {
                        label: 'Short CP 100',
                        icon: 'pi pi-fw pi-minus'
                    }
                ]
            },
            {
                label: 'Users',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Register',
                        icon: 'pi pi-fw pi-user-plus',

                    },
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-user-minus',

                    },
                    {
                        label: 'Profile',
                        icon: 'pi pi-fw pi-users',
                    }
                ]
            },
            {
                label: 'Signout',
                icon: 'pi pi-fw pi-power-off'
            }
        ];
    
        const start = <img alt="logo" src="/favicon.ico"  height="40" className="mr-2"></img>;
        const end = <InputText placeholder="Search" type="text" />;

        return (
            <div style={{zIndex:1000}}>
                <div className="card">
                    <Menubar model={items} start={start} end={end} />
                </div>
                
            </div>
        );
}

export default AppMenu;