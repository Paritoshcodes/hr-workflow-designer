import { useCallback } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'

export function useValidation() {
  const validate = useWorkflowStore((state) => state.validate)
  const validationResult = useWorkflowStore((state) => state.validationResult)

  const getNodeErrors = useCallback(
    (nodeId: string) => {
      if (!validationResult) {
        return []
      }

      return [
        ...validationResult.errors.filter((error) => error.nodeId === nodeId),
        ...validationResult.warnings.filter((warning) => warning.nodeId === nodeId),
      ]
    },
    [validationResult]
  )

  const hasNodeError = useCallback(
    (nodeId: string) => getNodeErrors(nodeId).some((error) => error.severity === 'error'),
    [getNodeErrors]
  )

  const hasNodeWarning = useCallback(
    (nodeId: string) => getNodeErrors(nodeId).some((error) => error.severity === 'warning'),
    [getNodeErrors]
  )

  return {
    validate,
    validationResult,
    getNodeErrors,
    hasNodeError,
    hasNodeWarning,
  }
}
