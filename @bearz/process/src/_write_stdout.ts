import { stdout } from "./streams.ts";

stdout.writeSync(new TextEncoder().encode("writeSync\n"));
stdout.write(new TextEncoder().encode("write\n"));
