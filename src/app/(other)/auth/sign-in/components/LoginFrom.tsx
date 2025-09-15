'use client'
import TextFormInput from '@/components/form/TextFormInput'
import Link from 'next/link'
import { Button, FormCheck } from 'react-bootstrap'
import useSignIn from './useSignIn'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { Controller } from 'react-hook-form'

const LoginFrom = () => {
  const { loading, login, control, branches, branchesLoading } = useSignIn()
  return (
    <form className="authentication-form" onSubmit={login}>
      <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email" id="email-id" placeholder="Enter your email" />

      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label={
          <>
            <label className="form-label" htmlFor="example-password">
              Password
            </label>
          </>
        }
      />
      <label className="form-label">Select Branch</label>
      <Controller
        name="branchId"
        control={control}
        render={({ field }) => (
          <select {...field} className="form-control form-select mb-3" disabled={branchesLoading}>
            <option value="">{branchesLoading ? 'Loading branches...' : 'Select Branch'}</option>
            {branches.map((b: any) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      />
      <div className="mb-3">
        <FormCheck label="Remember me" id="sign-in" />
      </div>
      <div className="mb-1 text-center d-grid">
        <Button variant="primary" type="submit" disabled={loading}>
          Sign In
        </Button>
      </div>
    </form>
  )
}

export default LoginFrom

