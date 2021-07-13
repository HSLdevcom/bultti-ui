import { gql } from '@apollo/client'
import { UserFragment } from '../common/query/authQueries'

export const lightPreInspectionFragment = gql`
  fragment LightPreInspectionFragment on PreInspection {
    id
    inspectionType
    name
    createdAt
    updatedAt
    startDate
    endDate
    inspectionStartDate
    inspectionEndDate
    version
    status
    minStartDate
    operatorId
    seasonId
    operator {
      id
      operatorName
    }
    season {
      id
      season
      startDate
      endDate
    }
  }
`

export const lightPostInspectionFragment = gql`
  fragment LightPostInspectionFragment on PostInspection {
    id
    inspectionType
    name
    createdAt
    updatedAt
    inspectionDateId
    inspectionStartDate
    inspectionEndDate
    status
    operatorId
    seasonId
    hslAccepted
    operatorAccepted
    operator {
      id
      operatorName
    }
    season {
      id
      season
      startDate
      endDate
    }
  }
`

export const preInspectionFragment = gql`
  fragment PreInspectionFragment on PreInspection {
    ...LightPreInspectionFragment
    inspectionErrors {
      keys
      objectId
      referenceKeys
      type
    }
    userRelations {
      id
      createdAt
      updatedAt
      relatedBy
      subscribed
      user {
        id
        email
        name
        organisation
        role
      }
    }
  }
  ${lightPreInspectionFragment}
`

export const postInspectionFragment = gql`
  fragment PostInspectionFragment on PostInspection {
    ...LightPostInspectionFragment
    linkedInspectionUpdateAvailable
    linkedInspections {
      id
      startOfWeek
      inspection {
        ...LightPreInspectionFragment
      }
    }
    inspectionErrors {
      keys
      objectId
      referenceKeys
      type
    }
    userRelations {
      id
      createdAt
      updatedAt
      relatedBy
      subscribed
      user {
        id
        email
        name
        organisation
        role
      }
    }
  }
  ${lightPreInspectionFragment}
  ${lightPostInspectionFragment}
`

const lightInspectionUnionFragment = gql`
  fragment LightInspectionUnionFragment on Inspection {
    ... on PreInspection {
      ...LightPreInspectionFragment
    }
    ... on PostInspection {
      ...LightPostInspectionFragment
    }
  }
  ${lightPreInspectionFragment}
  ${lightPostInspectionFragment}
`

const inspectionUnionFragment = gql`
  fragment InspectionUnionFragment on Inspection {
    ... on PreInspection {
      ...PreInspectionFragment
    }
    ... on PostInspection {
      ...PostInspectionFragment
    }
  }
  ${preInspectionFragment}
  ${postInspectionFragment}
`

export const inspectionQuery = gql`
  query inspectionById($inspectionId: String!) {
    inspection(inspectionId: $inspectionId) {
      ...InspectionUnionFragment
    }
  }
  ${inspectionUnionFragment}
`

export const currentInspectionsByOperatorAndSeasonQuery = gql`
  query currentInspectionsByOperatorAndSeason(
    $operatorId: Int!
    $seasonId: String!
    $inspectionType: InspectionType!
  ) {
    currentInspectionsByOperatorAndSeason(
      operatorId: $operatorId
      seasonId: $seasonId
      inspectionType: $inspectionType
    ) {
      ...LightInspectionUnionFragment
    }
  }
  ${lightInspectionUnionFragment}
`

export const inspectionsByOperatorQuery = gql`
  query inspectionsByOperator($operatorId: Int!, $inspectionType: InspectionType!) {
    inspectionsByOperator(operatorId: $operatorId, inspectionType: $inspectionType) {
      ...LightInspectionUnionFragment
    }
  }
  ${lightInspectionUnionFragment}
`

export const inspectionsTimelineByOperatorQuery = gql`
  query inspectionsTimeline($operatorId: Int!, $inspectionType: InspectionType!) {
    inspectionsTimeline(operatorId: $operatorId, inspectionType: $inspectionType) {
      id
      inspectionStartDate
      inspectionEndDate
      operatorName
      seasonId
      version
    }
  }
`

export const createInspectionMutation = gql`
  mutation createInspection($inspectionInput: InitialInspectionInput!) {
    createInspection(inspection: $inspectionInput) {
      ...InspectionUnionFragment
    }
  }
  ${inspectionUnionFragment}
`

export const updateInspectionMutation = gql`
  mutation updateInspection($inspectionId: String!, $inspectionInput: InspectionInput!) {
    updateInspection(inspectionId: $inspectionId, inspection: $inspectionInput) {
      ...InspectionUnionFragment
    }
  }
  ${inspectionUnionFragment}
`

export const updateLinkedInspectionsMutation = gql`
  mutation updateLinkedInspections($inspectionId: String!) {
    updateLinkedInspection(inspectionId: $inspectionId) {
      ...PostInspectionFragment
    }
  }
  ${postInspectionFragment}
`

export const submitInspectionMutation = gql`
  mutation submitInspection($inspectionId: String!) {
    submitInspection(inspectionId: $inspectionId) {
      ...InspectionUnionFragment
    }
  }
  ${inspectionUnionFragment}
`

export const makePostInspectionSanctionableMutation = gql`
  mutation postInspectionSanctionable($inspectionId: String!) {
    inspectionSanctionable(inspectionId: $inspectionId) {
      ...PostInspectionFragment
    }
  }
  ${postInspectionFragment}
`

export const publishInspectionMutation = gql`
  mutation publishInspection($inspectionId: String!) {
    publishInspection(inspectionId: $inspectionId) {
      ...InspectionUnionFragment
    }
  }
  ${inspectionUnionFragment}
`

export const rejectInspectionMutation = gql`
  mutation rejectInspection($inspectionId: String!) {
    rejectInspection(inspectionId: $inspectionId) {
      ...InspectionUnionFragment
    }
  }
  ${inspectionUnionFragment}
`

export const inspectionUserRelationsQuery = gql`
  query inspectionUserRelations($inspectionId: String!) {
    inspectionUserRelations(inspectionId: $inspectionId) {
      id
      createdAt
      updatedAt
      relatedBy
      subscribed
      preInspection {
        id
      }
      postInspection {
        id
      }
      user {
        ...UserFragment
      }
    }
  }
  ${UserFragment}
`

export const toggleUserInspectionSubscription = gql`
  mutation InspectionUserSubscribed($inspectionId: String!, $userId: String!) {
    toggleInspectionUserSubscribed(inspectionId: $inspectionId, userId: $userId) {
      id
      createdAt
      updatedAt
      relatedBy
      subscribed
      preInspection {
        id
      }
      postInspection {
        id
      }
      user {
        id
      }
    }
  }
`

export const removeInspectionMutation = gql`
  mutation removeInspection($inspectionId: String!) {
    removeInspection(inspectionId: $inspectionId)
  }
`

// This returns an abbreviated InspectionStatusUpdate object masquerading
// as an Inspection to facilitate easier Apollo cache updates.
export const inspectionStatusSubscription = gql`
  subscription inspectionStatus($inspectionId: String!) {
    inspectionStatus(inspectionId: $inspectionId) {
      id
      status
      startDate
      endDate
      inspectionStartDate
      inspectionEndDate
      version
    }
  }
`

export const inspectionErrorSubscription = gql`
  subscription inspectionError($inspectionId: String!) {
    inspectionError(inspectionId: $inspectionId) {
      id
      status
      errorType
      message
    }
  }
`
