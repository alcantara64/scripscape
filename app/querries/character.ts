import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ScriptCharacter } from "@/interface/script"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

type UpdateCharactersVars = {
  script_id: number
  character_id: number
  character: Omit<ScriptCharacter, "id">
}
type CreateCharactersVars = {
  scrip_id: number
  character: Omit<ScriptCharacter, "id">
}

export const useGetCharactersByScript = (script_id: number) => {
  return useQuery({
    queryKey: ["get-script-characters", script_id],
    queryFn: () => getOrThrow(scriptService.getCharactersByScript(script_id)),
  })
}
async function createPartCharacter(vars: CreateCharactersVars) {
  return getOrThrow(scriptService.createScriptCharacters(vars.scrip_id, vars.character))
}
export const useCreateScriptCharacter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPartCharacter,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-script-characters", variables.scrip_id] })
    },
  })
}

async function updateScriptCharacter(vars: UpdateCharactersVars) {
  return getOrThrow(
    scriptService.updateScriptCharacters(vars.character_id, vars.script_id, vars.character),
  )
}
export const useScriptUpdateCharacter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateScriptCharacter,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-script-characters", variables.script_id] })
    },
  })
}
