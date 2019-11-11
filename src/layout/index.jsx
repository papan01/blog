import React, { useState } from "react"
import Cookies from "universal-cookie"
import Helmet from "react-helmet"
import Config from "../../data/siteConfig";
import Navigation from "../components/navigation";
import "./style/style.scss"

const Layout = props => {
  const cookies = new Cookies()
  let userTheme = cookies.get("theme")
  if (!userTheme) {
    cookies.set("theme", "dark", { path: "/" })
    userTheme = "dark"
  }
  const [theme] = useState(userTheme)

  return (
    <Navigation>
      <Helmet>
        <meta name="description" content={Config.siteDescription} />
        <body className={theme} />
      </Helmet>
      {props.children}
    </Navigation>
  )
}

export default Layout
