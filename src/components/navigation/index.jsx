import React from 'react';
import { Link } from 'gatsby';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import Logo from '../../../static/logos/logo.png';
import config from '../../../data/siteConfig';
import './style.scss';

const NavList = () => {
    return (
        <nav>
            <ul>
            {
                config.navbarLinks.map((item,index) => 
                    <li key = {index} >
                        <Link to={item.url} activeClassName='active'>
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </Link>
                    </li>
                )
            }
            </ul>
        </nav>
    )
}


export default React.memo( props => {
    return (
        <div>
            <header className="top-bar">
                <div className="container">
                    <div className="logo">
                        <Link to="/"><img src={Logo} alt={config.siteTitle}/></Link>
                    </div>
                    <NavList/>
                </div>
            </header>
            { props.children }
        </div>
    )
});

