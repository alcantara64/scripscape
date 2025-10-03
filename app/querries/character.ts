import { useMutation } from "@tanstack/react-query"

import { ScriptCharacter } from "@/interface/script"
import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

type UpdateCharactersVars = {
  script_id: number
  character_id: number
  character: Omit<ScriptCharacter, "id">
}

async function updateScriptCharacter(vars: UpdateCharactersVars) {
  return getOrThrow(
    scriptService.updateScriptCharacters(vars.character_id, vars.script_id, vars.character),
  )
}
export const useScriptUpdateCharacter = () => {
  return useMutation({
    mutationFn: updateScriptCharacter,
  })
}
