import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ScriptLocationImage } from "@/interface/script"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

type CreateLocationVars = {
  script_id: number
  Loc: Omit<ScriptLocationImage, "id">
}
type UpdateLocationVars = {
  script_id: number
  payload: ScriptLocationImage
}

async function createScriptLocation(vars: CreateLocationVars) {
  return getOrThrow(scriptService.createScriptLocation(vars.script_id, vars.Loc))
}

export const useScriptPartLocation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createScriptLocation,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-location-by-script-id", variables.script_id] })
    },
  })
}

export const useGetLocationImagesByScriptId = (scriptId: number) => {
  return useQuery({
    queryKey: ["get-location-by-script-id", scriptId],
    queryFn: () => getOrThrow(scriptService.getLocationsByScript(scriptId)),
  })
}

async function updateScriptLocation(vars: UpdateLocationVars) {
  return getOrThrow(scriptService.updateScriptLocation(vars.script_id, vars.payload))
}

export const useUpdateScriptLocation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateScriptLocation,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-location-by-script-id", variables.script_id] })
    },
  })
}
