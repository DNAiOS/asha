"""Search plus rerank for your own RAG.

`/v1/search` returns ranked, typed passages from the committed corpus with
locators (PMID, DOI, URL); retracted items are flagged and ranked last.
`/v1/rerank` re-scores any documents for a query (relevance only). Together
they give your own model a cited context block. No Asha answer is generated.

Run: ASHA_API_KEY=... python cookbook/07_search_rerank_rag.py
"""

from askasha import Asha
from askasha.types import SearchFilters

QUESTION = "anticoagulation for atrial fibrillation in chronic kidney disease"


def main() -> int:
    client = Asha()
    hits = client.search(QUESTION, top_k=20, filters=SearchFilters(year_from=2018))
    usable = [h for h in hits.data if not h.retracted and not h.refuted and h.snippet]
    if not usable:
        print("No passages matched.")
        return 1

    ranked = client.rerank(QUESTION, [h.snippet or "" for h in usable], top_n=min(5, len(usable)))
    context = []
    for n, item in enumerate(ranked.results, start=1):
        h = usable[item.index]
        loc = h.locator
        where = (f"PMID {loc.pmid}" if loc and loc.pmid else (loc.doi or loc.url if loc else None)) or h.collection
        context.append(f"[{n}] {h.title} ({h.year or 'n.d.'}; {where}; relevance {item.relevance_score:.3f})\n{h.snippet}")

    print("Context block for your model:\n")
    print("\n\n".join(context))
    print(f"\nsearch: {len(hits.data)} passages, {hits.usage.amount_usd if hits.usage else '?'} USD; "
          f"rerank: {len(ranked.results)} kept, {ranked.usage.amount_usd if ranked.usage else '?'} USD")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
