import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const AboutPage = () => (
  <Layout>
    <Seo title="about" />
    <p>{`the colors dont mean anything`}</p>
    <Link to="/">back</Link>
  </Layout>
)

export default AboutPage
