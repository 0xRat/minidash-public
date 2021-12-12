/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */
import React from "react"
import {Helmet} from "react-helmet"
import { Grommet } from 'grommet'
import { theme } from './src/components/theme.js'

export const wrapRootElement = ({ element }) => {
  const siteName = 'Minimal Dashboard'
	return (
    <Grommet theme={theme} themeMode='dark'>
      <div id="application">
        <Helmet>
          <meta charSet="utf-8" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
          <title>{siteName}</title>
        </Helmet>
        {element}
      </div>
    </Grommet>
	)
}
