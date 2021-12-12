/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql, Link } from "gatsby"

import Header from "./header"
import { Box, Footer, Grommet, Button } from 'grommet'
import { deepFreeze } from "grommet/utils"

import { BiCopyright } from "react-icons/bi"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <Box align='center'>
      <Box
        tag='header'
        direction='row'
        align='center'
        justify='between'
        background='brand'
        height='xxsmall'
        elevation='medium'
        round='small'
        width='large'
      >
        <Box direction='row' pad='small'>
          {data.site.siteMetadata?.title.toLowerCase() || `Title`}
        </Box>
        <Box direction='row' pad='small'>
          <Link to='/'>
            <Button style={{ fontSize: '14px' }} color='brand' label="dashboard" />
          </Link>
          <Link to='/stats'>
            <Button style={{ fontSize: '14px' }} color='brand' label="stats" />
          </Link>
          <Link to='/about'>
            <Button style={{ fontSize: '14px' }} color='brand' label="about" />
          </Link>
        </Box>
      </Box>
      <Box> 
        <Box margin="small" pad="small" align="center">{children}</Box>
        <Footer style={{ fontSize: "10px" }} gap='xxsmall' justify='start'>
          <BiCopyright />{new Date().getFullYear()}, built with <a href="https://gatsbyjs.com">gatsby</a>
        </Footer>
      </Box>
    </Box>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
