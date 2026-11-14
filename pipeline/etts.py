import certifi, sys, os, asyncio
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts
async def main(text, voice, out, rate):
    c = edge_tts.Communicate(text, voice, rate=rate, proxy=os.environ.get("HTTPS_PROXY"))
    await c.save(out)
asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else "+0%"))
