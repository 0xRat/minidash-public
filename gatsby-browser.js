/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */
import React from "react"
import { Grommet, Box } from 'grommet'
import {Helmet} from "react-helmet"
import { theme } from './src/components/theme.js'
import './src/styles/styles.scss'

export const wrapRootElement = ({ element }) => {
  const siteName = 'Minimal Dashboard'
	return (
    <Grommet theme={theme}>
      <Helmet>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
        <title>{siteName}</title>
      </Helmet>
      <Box id="application">
        {element}
      </Box>
    </Grommet>
	)
}

