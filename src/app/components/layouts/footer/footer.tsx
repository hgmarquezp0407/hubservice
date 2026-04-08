"use client"
import Link from 'next/link'
import React, { Fragment } from 'react'

const Footer = () => {
  return (
    <Fragment>
      <footer className="footer mt-auto py-3 bg-white text-center">
        <div className="container">
          <span className="text-muted"> Copyright © <span id="year"> {new Date().getFullYear()} </span>
            <Link href="#!" scroll={false} className="text-primary fw-medium">APP HUB SERVICE</Link>. <Link href="#!" scroll={false}>
            </Link> Todos los derechos reservados</span>
        </div>
      </footer>
    </Fragment>
  )
}

export default Footer