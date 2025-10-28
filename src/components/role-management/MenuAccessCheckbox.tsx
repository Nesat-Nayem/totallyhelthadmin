'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Form, Row, Col } from 'react-bootstrap'
import { POS_ROLE_MENU_ITEMS } from '@/assets/data/pos-role-menu-items'
import { MenuItemType } from '@/types/menu'

export interface MenuAccess {
  [key: string]: {
    checked: boolean
    children?: { [key: string]: boolean }
  }
}

interface MenuAccessCheckboxProps {
  selectedAccess: MenuAccess
  onAccessChange: (access: MenuAccess) => void
  disabled?: boolean
}

const MenuAccessCheckbox: React.FC<MenuAccessCheckboxProps> = ({
  selectedAccess,
  onAccessChange,
  disabled = false
}) => {
  const [access, setAccess] = useState<MenuAccess>(selectedAccess || {})
  const prevSelectedAccessRef = useRef<MenuAccess>()

  useEffect(() => {
    if (selectedAccess && JSON.stringify(selectedAccess) !== JSON.stringify(prevSelectedAccessRef.current)) {
      setAccess(selectedAccess)
      prevSelectedAccessRef.current = selectedAccess
    }
  }, [selectedAccess])

  const handleModuleChange = (moduleKey: string, checked: boolean) => {
    if (disabled) {
      return
    }
    
    if (!moduleKey) {
      console.error('MenuAccessCheckbox - moduleKey is required')
      return
    }
    
    const newAccess = JSON.parse(JSON.stringify(access || {}))
    
    if (checked) {
      // If module is checked, check all its children
      newAccess[moduleKey] = { checked: true }
      const menuItem = POS_ROLE_MENU_ITEMS.find(item => item.key === moduleKey)
      if (menuItem?.children) {
        newAccess[moduleKey].children = {}
        menuItem.children.forEach(child => {
          newAccess[moduleKey].children![child.key] = true
        })
      }
      
    } else {
      // If module is unchecked, uncheck all its children
      newAccess[moduleKey] = { checked: false }
      if (newAccess[moduleKey].children) {
        Object.keys(newAccess[moduleKey].children!).forEach(childKey => {
          newAccess[moduleKey].children![childKey] = false
        })
      }
      
    }
    
    setAccess(newAccess)
    onAccessChange(newAccess)
  }

  const handleSubModuleChange = (moduleKey: string, subModuleKey: string, checked: boolean) => {
    if (disabled) {
      return
    }
    
    if (!moduleKey || !subModuleKey) {
      console.error('MenuAccessCheckbox - moduleKey and subModuleKey are required')
      return
    }
    
    const newAccess = JSON.parse(JSON.stringify(access || {}))
    
    if (!newAccess[moduleKey]) {
      newAccess[moduleKey] = { checked: false, children: {} }
    }
    
    if (!newAccess[moduleKey].children) {
      newAccess[moduleKey].children = {}
    }
    
    newAccess[moduleKey].children![subModuleKey] = checked
    
    // Check if all children are selected, if so, select the parent module
    const menuItem = POS_ROLE_MENU_ITEMS.find(item => item.key === moduleKey)
    if (menuItem?.children) {
      const allChildrenSelected = menuItem.children.every(child => 
        newAccess[moduleKey].children![child.key] === true
      )
      newAccess[moduleKey].checked = allChildrenSelected
    }
    
    setAccess(newAccess)
    onAccessChange(newAccess)
  }

  const isModuleChecked = (moduleKey: string): boolean => {
    if (!moduleKey || !access) return false
    return access[moduleKey]?.checked || false
  }

  const isSubModuleChecked = (moduleKey: string, subModuleKey: string): boolean => {
    if (!moduleKey || !subModuleKey || !access) return false
    return access[moduleKey]?.children?.[subModuleKey] || false
  }

  const isModuleIndeterminate = (moduleKey: string): boolean => {
    if (!moduleKey || !access) return false
    
    const menuItem = POS_ROLE_MENU_ITEMS.find(item => item.key === moduleKey)
    if (!menuItem?.children) return false
    
    const childrenStates = menuItem.children.map(child => 
      access[moduleKey]?.children?.[child.key] || false
    )
    
    const hasChecked = childrenStates.some(state => state)
    const allChecked = childrenStates.every(state => state)
    
    return hasChecked && !allChecked
  }

  const getSelectedCount = (): number => {
    if (!access) return 0
    
    let count = 0
    POS_ROLE_MENU_ITEMS.forEach(item => {
      if (!item.isTitle) {
        const moduleAccess = access[item.key]
        if (moduleAccess) {
          // Count main module if checked
          if (moduleAccess.checked) count++
          
          // Count children if they exist and are checked
          if (moduleAccess.children && item.children) {
            item.children.forEach(child => {
              if (moduleAccess.children![child.key]) count++
            })
          }
        }
      }
    })
    return count
  }

  const getTotalCount = (): number => {
    let count = 0
    POS_ROLE_MENU_ITEMS.forEach(item => {
      if (!item.isTitle) {
        count++ // Main module
        if (item.children) {
          count += item.children.length // Sub-modules
        }
      }
    })
    return count
  }

  const isAllSelected = (): boolean => {
    if (!access) return false
    
    // Check if all modules and their children are selected
    return POS_ROLE_MENU_ITEMS.every(item => {
      if (item.isTitle) return true // Skip title items
      
      const moduleAccess = access[item.key]
      if (!moduleAccess) return false
      
      // Check if main module is selected
      if (!moduleAccess.checked) return false
      
      // Check if all children are selected (if they exist)
      if (item.children && moduleAccess.children) {
        return item.children.every(child => moduleAccess.children![child.key] === true)
      }
      
      return true
    })
  }

  const isIndeterminate = (): boolean => {
    if (!access) return false
    
    const totalCount = getTotalCount()
    const selectedCount = getSelectedCount()
    
    // If nothing is selected, not indeterminate
    if (selectedCount === 0) return false
    
    // If everything is selected, not indeterminate
    if (selectedCount === totalCount) return false
    
    // If some but not all are selected, it's indeterminate
    return selectedCount > 0 && selectedCount < totalCount
  }

  const handleSelectAllChange = (checked: boolean) => {
    if (disabled) {
      return
    }
    
    const newAccess: MenuAccess = {}
    
    if (checked) {
      // Select all modules and their children
      POS_ROLE_MENU_ITEMS.forEach(item => {
        if (!item.isTitle) {
          newAccess[item.key] = { checked: true }
          if (item.children) {
            newAccess[item.key].children = {}
            item.children.forEach(child => {
              newAccess[item.key].children![child.key] = true
            })
          }
          
        }
      })
    } else {
      // Deselect all modules and their children
      POS_ROLE_MENU_ITEMS.forEach(item => {
        if (!item.isTitle) {
          newAccess[item.key] = { checked: false }
          if (item.children) {
            newAccess[item.key].children = {}
            item.children.forEach(child => {
              newAccess[item.key].children![child.key] = false
            })
          }
          
        }
      })
    }
    
    setAccess(newAccess)
    onAccessChange(newAccess)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h5" className="mb-0">
          Menu Access Permissions
          <small className="text-muted ms-2">
            ({getSelectedCount()} of {getTotalCount()} selected)
          </small>
        </CardTitle>
        <div className="form-check mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="select-all-permissions"
            checked={isAllSelected()}
            ref={(input) => {
              if (input) {
                input.indeterminate = isIndeterminate()
              }
            }}
            onChange={(e) => handleSelectAllChange(e.target.checked)}
            disabled={disabled}
          />
          <label className="form-check-label fw-bold text-primary" htmlFor="select-all-permissions">
            Select All Permissions
          </label>
        </div>
      </CardHeader>
      <CardBody>
        <div className="menu-access-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {POS_ROLE_MENU_ITEMS.map((item) => {
            // Debug logging for sales section
            if (item.key === 'sales') {
              console.log('Sales section found:', item);
              console.log('Sales children:', item.children);
            }
            
            if (item.isTitle) {
              return (
                <div key={item.key} className="mb-3">
                  <h6 className="text-muted text-uppercase fw-semibold mb-2">
                    {item.label}
                  </h6>
                </div>
              )
            }


            return (
              <div key={item.key} className="mb-3">
                {/* Main Module Checkbox */}
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`module-${item.key}`}
                    checked={isModuleChecked(item.key)}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isModuleIndeterminate(item.key)
                      }
                    }}
                    onChange={(e) => handleModuleChange(item.key, e.target.checked)}
                    disabled={disabled}
                  />
                  <label className="form-check-label fw-semibold" htmlFor={`module-${item.key}`}>
                    {item.label}
                  </label>
                </div>

                {/* Sub-modules */}
                {item.children && item.children.length > 0 && (
                  <div className="ms-4">
                    {item.children.map((child, index) => {
                      // Debug logging for sales section
                      if (item.key === 'sales') {
                        console.log('Sales child:', child.key, child.label, 'Index:', index);
                      }
                      return (
                        <div key={child.key} className="form-check mb-1" style={{ display: 'block', minHeight: '30px' }}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`submodule-${child.key}`}
                            checked={isSubModuleChecked(item.key, child.key)}
                            onChange={(e) => handleSubModuleChange(item.key, child.key, e.target.checked)}
                            disabled={disabled}
                          />
                          <label className="form-check-label" htmlFor={`submodule-${child.key}`} style={{ display: 'block', minHeight: '20px' }}>
                            {child.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}

export default MenuAccessCheckbox
