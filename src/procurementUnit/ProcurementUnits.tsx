import React, { useCallback, useContext, useState } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import ProcurementUnitItem from './ProcurementUnitItem'
import {
  Button,
  ButtonSize,
  ButtonStyle,
  TextButton,
} from '../common/components/buttons/Button'
import { FlexRow, TransparentPageSection } from '../common/components/common'
import { useQueryData } from '../util/useQueryData'
import { procurementUnitsQuery } from './procurementUnitsQuery'
import { LoadingDisplay } from '../common/components/Loading'
import { InspectionContext } from '../inspection/InspectionContext'
import { MessageView } from '../common/components/Messages'
import { ProcurementUnit as ProcurementUnitType, ValidationErrorData } from '../schema-types'
import { text, Text } from '../util/translate'

const ProcurementUnitsView = styled(TransparentPageSection)``

export type PropTypes = {
  operatorId: number
  startDate: string
  endDate: string
  requirementsEditable: boolean
  getErrorsById?: (objectId: string) => ValidationErrorData[]
  contractSelectionDate: Date
}

const ProcurementUnits: React.FC<PropTypes> = observer(
  ({
    getErrorsById,
    requirementsEditable = true,
    operatorId,
    startDate,
    endDate,
    contractSelectionDate,
  }) => {
    let { inspection } = useContext(InspectionContext)

    let catalogueEditable = !inspection
    let showExecutionRequirements = !!inspection

    const [procurementUnitsExpanded, setProcurementUnitsExpanded] = useState(false)

    const toggleProcurementUnitsExpanded = useCallback(() => {
      setProcurementUnitsExpanded((currentVal) => !currentVal)
    }, [])

    let getUnitErrors = useCallback((id: string) => (getErrorsById ? getErrorsById(id) : []), [
      getErrorsById,
    ])

    // Get the operating units for the selected operator.
    const {
      data: procurementUnits = [],
      loading: procurementUnitsLoading,
      refetch,
    } = useQueryData<ProcurementUnitType[]>(procurementUnitsQuery, {
      skip: !operatorId,
      variables: {
        operatorId: operatorId,
        startDate,
        endDate,
      },
    })

    return (
      <ProcurementUnitsView>
        <LoadingDisplay loading={procurementUnitsLoading} />
        {!procurementUnitsLoading && (!procurementUnits || procurementUnits?.length === 0) ? (
          <MessageView>
            <Text>procurementUnit_noValidForOperator</Text>
          </MessageView>
        ) : (
          <>
            <FlexRow>
              {procurementUnits.length !== 0 && (
                <TextButton onClick={toggleProcurementUnitsExpanded}>
                  {procurementUnitsExpanded
                    ? text('procurementUnit_hideAllProcurementUnits')
                    : text('procurementUnit_showAllProcurementUnits')}
                </TextButton>
              )}
              <Button
                loading={procurementUnitsLoading}
                style={{ marginLeft: 'auto' }}
                buttonStyle={ButtonStyle.SECONDARY}
                size={ButtonSize.SMALL}
                onClick={() => refetch()}>
                <Text>update</Text>
              </Button>
            </FlexRow>
            {procurementUnits.map((procurementUnit) => {
              let unitErrors = getUnitErrors(procurementUnit.id)

              return (
                <ProcurementUnitItem
                  validationErrors={unitErrors}
                  requirementsEditable={requirementsEditable}
                  catalogueEditable={catalogueEditable}
                  showExecutionRequirements={showExecutionRequirements}
                  key={procurementUnit.id}
                  startDate={startDate}
                  endDate={endDate}
                  procurementUnit={procurementUnit}
                  expanded={procurementUnitsExpanded}
                  contractSelectionDate={contractSelectionDate}
                />
              )
            })}
          </>
        )}
      </ProcurementUnitsView>
    )
  }
)

export default ProcurementUnits
