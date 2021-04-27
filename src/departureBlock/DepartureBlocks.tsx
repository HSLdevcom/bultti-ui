import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import { observer } from 'mobx-react-lite'
import { difference } from 'lodash'
import { Button } from '../common/components/buttons/Button'
import { defaultDayTypeGroup, useDayTypeGroups } from './departureBlocksCommon'
import DepartureBlockGroupItem from './DepartureBlockGroupItem'
import { useQueryData } from '../util/useQueryData'
import { availableDayTypesQuery } from './blockDeparturesQuery'
import { normalDayTypes } from '../constants'
import { InspectionContext } from '../inspection/InspectionContext'
import { useRefetch } from '../util/useRefetch'
import ExpandableSection, { HeaderMainHeading } from '../common/components/ExpandableSection'
import { Text } from '../util/translate'

const DepartureBlocksView = styled.div`
  margin-bottom: 0;
`

type PropTypes = {
  isEditable: boolean
  onUpdate: () => unknown
  isValid: boolean
}

const DepartureBlocks: React.FC<PropTypes> = observer(({ isEditable, onUpdate, isValid }) => {
  let { inspection } = useContext(InspectionContext)
  const inspectionId = inspection?.id || ''

  // Create day type groups with the special hook. Day type groups are departure blocks grouped by dayType.
  // The hook contains logic to select and deselect the dayTypes.
  let [
    dayTypeGroups,
    enabledDayTypes,
    { addDayTypeToGroup, removeDayTypeFromGroup, addDayTypeGroup },
  ] = useDayTypeGroups(isEditable)

  // The main query that fetches the departure blocks.
  let {
    data: availableDayTypesData,
    loading: departureBlocksLoading,
    refetch: refetchBlocks,
  } = useQueryData(availableDayTypesQuery, {
    fetchPolicy: 'network-only', // I don't think the cache works well with a simple string array
    notifyOnNetworkStatusChange: true,
    skip: !inspectionId,
    variables: {
      inspectionId: inspectionId,
    },
  })

  // Ensure the available dayTypes are in an array
  let dayTypesWithDepartures = useMemo(() => availableDayTypesData || [], [
    availableDayTypesData,
  ])

  // Figure out which day types are selectable. The day type is selectable (or unselectable)
  // when it doesn't have any blocks attached to it.
  let selectableDayTypes = useMemo(() => {
    return normalDayTypes.filter((dt) => !dayTypesWithDepartures.includes(dt))
  }, [dayTypesWithDepartures])

  // Callback for when the block configuration changes, which will update the blocks query.
  // Called from each day type group item.
  let refetch = useRefetch(refetchBlocks)

  let onBlocksChange = useCallback(() => {
    refetch()
    onUpdate()
  }, [refetch, onUpdate])

  // Add a new dayType group for each departure block group
  // if the dayYpe doesn't already exist in a group.
  useEffect(() => {
    for (let dayType of dayTypesWithDepartures) {
      if (!enabledDayTypes.includes(dayType)) {
        addDayTypeGroup(dayType)
      }
    }
  }, [dayTypesWithDepartures, enabledDayTypes])

  return (
    <ExpandableSection
      error={!isValid}
      headerContent={
        <HeaderMainHeading>
          <Text>departureBlocks</Text>
        </HeaderMainHeading>
      }>
      <DepartureBlocksView>
        {dayTypeGroups.map((dayTypeGroup, groupIndex) => {
          let groupDayTypesDepartures = Object.entries(dayTypeGroup)
            .filter(([, enabled]) => enabled)
            .map(([dayType]) => dayType)
            .filter((dayType) => dayTypesWithDepartures.includes(dayType))

          return (
            <DepartureBlockGroupItem
              key={`dayTypeGroup-${groupIndex}`}
              isEditable={isEditable}
              loading={departureBlocksLoading}
              hasDepartures={groupDayTypesDepartures.length !== 0}
              selectableDayTypes={selectableDayTypes}
              dayTypeGroup={dayTypeGroup}
              groupIndex={groupIndex}
              onAddDayType={addDayTypeToGroup}
              onRemoveDayType={removeDayTypeFromGroup}
              onBlocksChange={onBlocksChange}
            />
          )
        })}

        {isEditable &&
          difference(Object.keys(defaultDayTypeGroup), enabledDayTypes).length !== 0 && (
            <div>
              <Button onClick={() => addDayTypeGroup()}>Lisää päiväryhmä</Button>
            </div>
          )}
      </DepartureBlocksView>
    </ExpandableSection>
  )
})

export default DepartureBlocks
