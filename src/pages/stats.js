import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const StatsPage = () => (
  <Layout>
    <Seo title="stats" />
    <p>{`(。_。)`}</p>
    <Link to="/">back</Link>
  </Layout>
)

export default StatsPage
