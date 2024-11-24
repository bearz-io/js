import { stderr } from "./streams.ts";

stderr.writeSync(new TextEncoder().encode("writeSync\n"));
stderr.write(new TextEncoder().encode("write\n"));
