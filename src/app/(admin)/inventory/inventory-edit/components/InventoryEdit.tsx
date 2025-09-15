'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, useForm } from 'react-hook-form'
import Link from 'next/link'

type controlType = { control: Control<any> }

const GeneralInformationCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Inventory</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Item Title */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Item Name" placeholder="Enter Item Name" />
            </div>
          </Col>

          {/* Category */}
          <Col lg={6}>
            <label className="form-label">Category</label>
            <select name="category" id="" className="form-control form-select">
              <option value="">Select Category</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Meat">Meat</option>
              <option value="Beverages">Beverages</option>
              <option value="Dairy">Dairy</option>
            </select>
          </Col>

          {/* SKU / Tag ID */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="tag" label="Tag ID / SKU" placeholder="#******" />
            </div>
          </Col>

          {/* Stock Quantity */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="stock" label="Stock Quantity" placeholder="Enter Stock" />
            </div>
          </Col>

          {/* Unit of Measure */}
          <Col lg={6}>
            <label className="form-label">Unit of Measure</label>

            <select name="category" id="" className="form-control form-select">
              <option value="">Select Unit</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="ltr">Litre (ltr)</option>
              <option value="pcs">Pieces (pcs)</option>
            </select>
          </Col>

          {/* Reorder Level */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="reorderLevel" label="Reorder Level" placeholder="Enter Reorder Level" />
            </div>
          </Col>

          {/* Purchase Price */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="purchasePrice" label="Purchase Price" placeholder="Enter Purchase Price" />
            </div>
          </Col>

          {/* Selling Price */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="number" name="sellingPrice" label="Selling Price" placeholder="Enter Selling Price" />
            </div>
          </Col>

          {/* Supplier Name */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Select Supplier</label>
              <select name="category" id="" className="form-control form-select">
                <option value="">Select Supplier</option>
                <option value="Supplier 1">Supplier 1</option>
                <option value="Supplier 2">Supplier 2</option>
                <option value="Supplier 3">Supplier 3</option>
              </select>
            </div>
          </Col>

          {/* purchase Date */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="date" name="purchaseDate" label="Purchase Date" />
            </div>
          </Col>
          {/* Expiry Date */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="date" name="expiryDate" label="Expiry Date" />
            </div>
          </Col>

          {/* Storage Location */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="storageLocation" label="Storage Location" placeholder="Enter Storage Location" />
            </div>
          </Col>

          {/* Description */}
          <Col lg={12}>
            <div className="mb-3">
              <TextAreaFormInput control={control} name="description" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const InventoryEdit = () => {
  const messageSchema = yup.object({
    title: yup.string().required('Please enter item name'),
    tag: yup.string().required('Please enter tag'),
    stock: yup.number().required('Please enter stock'),
    reorderLevel: yup.number().required('Please enter reorder level'),
    purchasePrice: yup.number().required('Please enter purchase price'),
    sellingPrice: yup.number().required('Please enter selling price'),
    supplier: yup.string().required('Please enter supplier'),
    expiryDate: yup.date().required('Please enter expiry date'),
    storageLocation: yup.string().required('Please enter storage location'),
    description: yup.string().required('Please enter description'),
  })

  const { handleSubmit, control } = useForm({ resolver: yupResolver(messageSchema) })

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <GeneralInformationCard control={control} />
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="outline-secondary" type="submit" className="w-100">
              Save
            </Button>
          </Col>
          <Col lg={2}>
            <Link href="" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default InventoryEdit
