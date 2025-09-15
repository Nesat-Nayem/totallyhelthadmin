import ComponentContainerCard from '@/components/ComponentContainerCard'
import DropzoneFormInput from '@/components/form/DropzoneFormInput'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'

const BlogList = () => {
  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center gap-1">
        <CardTitle as={'h4'} className="flex-grow-1">
          All Blog List
        </CardTitle>
        <Link href="/blog/add-blog" className="btn btn-lg btn-primary">
          Add Blog
        </Link>
      </CardHeader>
      <div>
        <div className="table-responsive">
          <table className="table align-middle mb-0 table-hover table-centered">
            <thead className="bg-light-subtle">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Image src="/images/blog/blog-1.jpg" alt="blog-1" width={50} height={50} className="rounded" />
                </td>
                <td>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, optio.</td>
                <td>Men</td>
                <td className="text-success">Active</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link href="/blog/blog-edit" className="btn btn-soft-primary btn-sm">
                      <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                    </Link>
                    <Link href="" className="btn btn-soft-danger btn-sm">
                      <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                    </Link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <CardFooter className="border-top">
        <nav aria-label="Page navigation example">
          <ul className="pagination justify-content-end mb-0">
            <li className="page-item">
              <Link className="page-link" href="">
                Previous
              </Link>
            </li>
            <li className="page-item active">
              <Link className="page-link" href="">
                1
              </Link>
            </li>
            <li className="page-item">
              <Link className="page-link" href="">
                2
              </Link>
            </li>
            <li className="page-item">
              <Link className="page-link" href="">
                3
              </Link>
            </li>
            <li className="page-item">
              <Link className="page-link" href="">
                Next
              </Link>
            </li>
          </ul>
        </nav>
      </CardFooter>
    </Card>
  )
}

export default BlogList
