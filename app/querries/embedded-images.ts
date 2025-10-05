import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { scriptService } from "@/services/scriptService"
import { getOrThrow } from "@/utils/query"

async function createEmbeddedImage(vars: { payload: { image: string }; script_id: number }) {
  return getOrThrow(scriptService.createEmbedImages(vars.script_id, vars.payload))
}

export const useCreateScriptEmbeddedImages = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createEmbeddedImage,
    onSuccess: (response, variables) => {
      qc.invalidateQueries({ queryKey: ["get-embedded-images-by-script_id", variables.script_id] })
    },
  })
}

export const useEmbeddedImagesByScript = (script_id: number) => {
  return useQuery({
    queryKey: ["get-embedded-images-by-script_id", script_id],
    queryFn: () => getOrThrow(scriptService.getEmbeddedImagesByScript(script_id)),
  })
}
