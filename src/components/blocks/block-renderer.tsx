import { getBlock } from "@/lib/blocks/registry";
import { BlockType } from "@/lib/blocks/types";

interface BlockRendererProps {
  type: BlockType;
  config: Record<string, unknown>;
  blockId: string;
  profileUsername: string;
}

export function BlockRenderer({
  type,
  config,
  blockId,
  profileUsername,
}: BlockRendererProps) {
  const descriptor = getBlock(type);

  if (!descriptor) {
    return null;
  }

  const parsed = descriptor.schema.safeParse(config);
  const safeConfig = parsed.success ? parsed.data : config;

  const { Render } = descriptor;

  return (
    <Render
      config={safeConfig}
      blockId={blockId}
      profileUsername={profileUsername}
    />
  );
}
