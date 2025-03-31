
var M = () => {
    let e = () => {
        let t = document.location.href
          , s = document.querySelector("body")
          , r = new MutationObserver( () => {
            t !== document.location.href && (t = document.location.href,
            window.top && (window.top.postMessage({
                type: "URL_CHANGED",
                url: document.location.href
            }, "https://lovable.dev"),
            window.top.postMessage({
                type: "URL_CHANGED",
                url: document.location.href
            }, "http://localhost:3000")))
        }
        );
        s && r.observe(s, {
            childList: !0,
            subtree: !0
        })
    }
    ;
    window.addEventListener("load", e)
}
;
var c = {
    HIGHLIGHT_COLOR: "#0da2e7",
    HIGHLIGHT_BG: "#0da2e71a",
    ALLOWED_ORIGINS: ["https://gptengineer.app", "http://localhost:3000", "https://lovable.dev"],
    DEBOUNCE_DELAY: 10,
    Z_INDEX: 1e4,
    TOOLTIP_OFFSET: 25,
    MAX_TOOLTIP_WIDTH: 200,
    SCROLL_DEBOUNCE: 420,
    FULL_WIDTH_TOOLTIP_OFFSET: "12px",
    HIGHLIGHT_STYLE: {
        FULL_WIDTH: {
            OFFSET: "-5px",
            STYLE: "solid"
        },
        NORMAL: {
            OFFSET: "0",
            STYLE: "solid"
        }
    },
    SELECTED_ATTR: "data-lov-selected",
    HOVERED_ATTR: "data-lov-hovered",
    OVERRIDE_STYLESHEET_ID: "lovable-override"
}
  , f = e => {
    c.ALLOWED_ORIGINS.forEach(t => {
        try {
            if (!window.parent)
                return;
            if (!e || typeof e != "object") {
                console.error("Invalid message format");
                return
            }
            window.parent.postMessage(e, t)
        } catch (s) {
            console.error(`Failed to send message to ${t}:`, s)
        }
    }
    )
}
  , q = () => new Promise(e => {
    if (document.readyState !== "loading") {
        e();
        return
    }
    requestIdleCallback( () => {
        e()
    }
    )
}
)
  , H = async () => {
    await q();
    let e = import.meta.hot;
    return e && await new Promise(t => {
        let s = () => {
            if (!e.data.pending) {
                t();
                return
            }
            setTimeout(s, 50)
        }
        ;
        s()
    }
    ),
    window.__REACT_SUSPENSE_DONE && await window.__REACT_SUSPENSE_DONE,
    !0
}
  , C = () => new Promise(e => {
    let t = document.getElementById("root");
    if (t && t.children.length > 0) {
        e();
        return
    }
    new MutationObserver( (r, o) => {
        let d = document.getElementById("root");
        d && d.children.length > 0 && (o.disconnect(),
        e())
    }
    ).observe(document.body, {
        childList: !0,
        subtree: !0
    })
}
);
var Y = () => {
    let e = window.fetch;
    window.fetch = async function(...t) {
        let s = Date.now();
        try {
            let r;
            if (t?.[1]?.body)
                try {
                    typeof t[1].body == "string" ? r = t[1].body : t[1].body instanceof FormData ? r = "FormData: " + Array.from(t[1].body.entries()).map( ([d,a]) => `${d}=${a}`).join("&") : t[1].body instanceof URLSearchParams ? r = t[1].body.toString() : r = JSON.stringify(t[1].body)
                } catch {
                    r = "Could not serialize request body"
                }
            let o = await e(...t);
            return f({
                type: "NETWORK_REQUEST",
                request: {
                    url: t?.[0] || o.url,
                    method: t?.[1]?.method || "GET",
                    status: o.status,
                    statusText: o.statusText,
                    responseBody: o?.clone?.() ? await o.clone().text() : void 0,
                    requestBody: r,
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - s,
                    origin: window.location.origin,
                    headers: t?.[1]?.headers ? Object.fromEntries(new Headers(t?.[1]?.headers)) : {}
                }
            }),
            o
        } catch (r) {
            let o;
            if (t?.[1]?.body)
                try {
                    typeof t[1].body == "string" ? o = t[1].body : t[1].body instanceof FormData ? o = "FormData: " + Array.from(t[1].body.entries()).map( ([T,i]) => `${T}=${i}`).join("&") : t[1].body instanceof URLSearchParams ? o = t[1].body.toString() : o = JSON.stringify(t[1].body)
                } catch {
                    o = "Could not serialize request body"
                }
            let d = {
                url: t?.[0],
                method: t?.[1]?.method || "GET",
                origin: window.location.origin,
                timestamp: new Date().toISOString(),
                duration: Date.now() - s,
                headers: t?.[1]?.headers ? Object.fromEntries(new Headers(t?.[1]?.headers)) : {},
                requestBody: o
            }
              , a = r instanceof TypeError ? {
                ...d,
                error: {
                    message: r?.message || "Unknown error",
                    stack: r?.stack
                }
            } : {
                ...d,
                error: {
                    message: r && typeof r == "object" && "message"in r && typeof r.message == "string" ? r.message : "Unknown fetch error",
                    stack: r && typeof r == "object" && "stack"in r && typeof r.stack == "string" ? r.stack : "Not available"
                }
            };
            throw f({
                type: "NETWORK_REQUEST",
                request: a
            }),
            r
        }
    }
}
  , z = () => {
    let e = document.querySelector("div#root");
    return e ? e.childElementCount === 0 : !1
}
  , P = ( () => {
    let e = !1
      , t = ({message: s, lineno: r, colno: o, filename: d, error: a}) => ({
        message: s,
        lineno: r,
        colno: o,
        filename: d,
        stack: a?.stack
    });
    return () => {
        if (e)
            return;
        let s = new Set
          , r = a => {
            let {lineno: T, colno: i, filename: E, message: b} = a;
            return `${b}|${E}|${T}|${i}`
        }
        ;
        Y();
        let o = a => s.has(a) ? !0 : (s.add(a),
        setTimeout( () => s.delete(a), 5e3),
        !1)
          , d = a => {
            let T = r(a);
            if (o(T))
                return;
            let i = t(a);
            f({
                type: "RUNTIME_ERROR",
                error: {
                    ...i,
                    blankScreen: z()
                }
            })
        }
        ;
        window.addEventListener("error", d),
        window.addEventListener("unhandledrejection", a => {
            if (!a.reason?.stack)
                return;
            let T = a.reason?.stack || a.reason?.message || String(a.reason);
            if (o(T))
                return;
            let i = {
                message: a.reason?.message || "Unhandled promise rejection",
                stack: a.reason?.stack || String(a.reason)
            };
            f({
                type: "UNHANDLED_PROMISE_REJECTION",
                error: i
            })
        }
        ),
        e = !0
    }
}
)();
var v = class {
    constructor(t) {
        this.message = `[Circular Reference to ${t}]`
    }
}
  , y = class {
    constructor(t, s) {
        this._type = t,
        this.value = s
    }
}
  , X = {
    maxDepth: 10,
    indent: 2,
    includeSymbols: !0,
    preserveTypes: !0,
    maxStringLength: 1e4,
    maxArrayLength: 100,
    maxObjectKeys: 100
};
function A(e, t={}, s=new WeakMap, r="root") {
    let o = {
        ...X,
        ...t
    };
    if (r.split(".").length > o.maxDepth)
        return new y("MaxDepthReached",`[Max depth of ${o.maxDepth} reached]`);
    if (e === void 0)
        return new y("undefined","undefined");
    if (e === null)
        return null;
    if (typeof e == "string")
        return e.length > o.maxStringLength ? new y("String",`${e.slice(0, o.maxStringLength)}... [${e.length - o.maxStringLength} more characters]`) : e;
    if (typeof e == "number")
        return Number.isNaN(e) ? new y("Number","NaN") : Number.isFinite(e) ? e : new y("Number",e > 0 ? "Infinity" : "-Infinity");
    if (typeof e == "boolean")
        return e;
    if (typeof e == "bigint")
        return new y("BigInt",e.toString());
    if (typeof e == "symbol")
        return new y("Symbol",e.toString());
    if (typeof e == "function")
        return new y("Function",{
            name: e.name || "anonymous",
            stringValue: e.toString().slice(0, o.maxStringLength)
        });
    if (e && typeof e == "object") {
        if (s.has(e))
            return new v(s.get(e));
        s.set(e, r)
    }
    if (e instanceof Error) {
        let i = {
            name: e.name,
            message: e.message,
            stack: e.stack
        };
        for (let E of Object.getOwnPropertyNames(e))
            i[E] || (i[E] = A(e[E], o, s, `${r}.${E}`));
        return new y("Error",i)
    }
    if (e instanceof Date)
        return new y("Date",{
            iso: e.toISOString(),
            value: e.valueOf(),
            local: e.toString()
        });
    if (e instanceof RegExp)
        return new y("RegExp",{
            source: e.source,
            flags: e.flags,
            string: e.toString()
        });
    if (e instanceof Promise)
        return new y("Promise","[Promise]");
    if (e instanceof WeakMap || e instanceof WeakSet)
        return new y(e.constructor.name,"[" + e.constructor.name + "]");
    if (e instanceof Set) {
        let i = Array.from(e);
        return i.length > o.maxArrayLength ? new y("Set",{
            values: i.slice(0, o.maxArrayLength).map( (E, b) => A(E, o, s, `${r}.Set[${b}]`)),
            truncated: i.length - o.maxArrayLength
        }) : new y("Set",{
            values: i.map( (E, b) => A(E, o, s, `${r}.Set[${b}]`))
        })
    }
    if (e instanceof Map) {
        let i = {}
          , E = 0
          , b = 0;
        for (let[O,D] of e.entries()) {
            if (b >= o.maxObjectKeys) {
                E++;
                continue
            }
            let S = typeof O == "object" ? JSON.stringify(A(O, o, s, `${r}.MapKey`)) : String(O);
            i[S] = A(D, o, s, `${r}.Map[${S}]`),
            b++
        }
        return new y("Map",{
            entries: i,
            truncated: E || void 0
        })
    }
    if (ArrayBuffer.isView(e)) {
        let i = e;
        return new y(e.constructor.name,{
            length: i.length,
            byteLength: i.byteLength,
            sample: Array.from(i.slice(0, 10))
        })
    }
    if (Array.isArray(e))
        return e.length > o.maxArrayLength ? e.slice(0, o.maxArrayLength).map( (i, E) => A(i, o, s, `${r}[${E}]`)).concat([`... ${e.length - o.maxArrayLength} more items`]) : e.map( (i, E) => A(i, o, s, `${r}[${E}]`));
    let d = {}
      , a = [...Object.getOwnPropertyNames(e)];
    o.includeSymbols && a.push(...Object.getOwnPropertySymbols(e).map(i => i.toString()));
    let T = 0;
    return a.slice(0, o.maxObjectKeys).forEach(i => {
        try {
            let E = e[i];
            d[i] = A(E, o, s, `${r}.${i}`)
        } catch (E) {
            d[i] = new y("Error",`[Unable to serialize: ${E.message}]`)
        }
    }
    ),
    a.length > o.maxObjectKeys && (T = a.length - o.maxObjectKeys,
    d["..."] = `${T} more properties`),
    d
}
var J = {
    log: console.log,
    warn: console.warn,
    error: console.error
}
  , Q = {
    log: "info",
    warn: "warning",
    error: "error"
}
  , k = ( () => {
    let e = !1;
    return () => {
        if (e)
            return;
        let t = s => {
            console[s] = (...r) => {
                J[s].apply(console, r);
                let o = null;
                if (s === "warn" || s === "error") {
                    let a = new Error;
                    a.stack && (o = a.stack.split(`
`).slice(2).join(`
`))
                }
                let d = r.map(a => A(a, {
                    maxDepth: 5,
                    includeSymbols: !0,
                    preserveTypes: !0
                }));
                f({
                    type: "CONSOLE_OUTPUT",
                    level: Q[s],
                    message: d.map(a => typeof a == "string" ? a : JSON.stringify(a, null, 2)).join(" ") + (o ? `
` + o : ""),
                    logged_at: new Date().toISOString(),
                    raw: d
                })
            }
        }
        ;
        t("log"),
        t("warn"),
        t("error"),
        e = !0
    }
}
)();
var Z = e => {
    let t = s => {
        let o = {
            type: "node",
            children: [],
            attrs: [...s.attributes].reduce( (d, a) => (d[a.name] = a.value,
            d), {}),
            tagName: s.tagName,
            data: R(s)
        };
        return [...s.childNodes].forEach(d => {
            d instanceof HTMLElement ? o.children.push(t(d)) : d instanceof Text && o.children.push({
                type: "text",
                textContent: d.textContent || ""
            })
        }
        ),
        o
    }
    ;
    return t(e)
}
  , $ = async () => {
    await H();
    let e = Z(document.querySelector("#root"));
    f({
        type: "COMPONENT_TREE",
        payload: {
            tree: e
        }
    })
}
;
var F = () => {
    window.addEventListener("keydown", e => {
        let t = [];
        e.metaKey && t.push("Meta"),
        e.ctrlKey && t.push("Ctrl"),
        e.altKey && t.push("Alt"),
        e.shiftKey && t.push("Shift");
        let s = e.key !== "Meta" && e.key !== "Control" && e.key !== "Alt" && e.key !== "Shift" ? e.key : ""
          , r = [...t, s].filter(Boolean).join("+");
        ["Meta+z", "Meta+Backspace", "Meta+d"].includes(r) && e.preventDefault(),
        r && f({
            type: "KEYBIND",
            payload: {
                compositeKey: r,
                rawEvent: {
                    key: e.key,
                    code: e.code,
                    metaKey: e.metaKey,
                    ctrlKey: e.ctrlKey,
                    altKey: e.altKey,
                    shiftKey: e.shiftKey
                },
                timestamp: Date.now()
            }
        })
    }
    , {
        passive: !0
    })
}
;
window.LOV_SELECTOR_SCRIPT_VERSION = "1.0.5";
var N = e => e.hasAttribute("data-lov-id") || e.hasAttribute("data-component-path")
  , U = e => {
    if (!e)
        return {};
    let[t,s,r] = e.split(":");
    return {
        filePath: t,
        lineNumber: parseInt(s || "0", 10),
        col: parseInt(r || "0", 10)
    }
}
  , L = e => {
    let t = e.getAttribute("data-lov-id") || "";
    if (t) {
        let {filePath: o, lineNumber: d, col: a} = U(t);
        return {
            filePath: o || "",
            lineNumber: d || 0,
            col: a || 0
        }
    }
    let s = e.getAttribute("data-component-path") || ""
      , r = e.getAttribute("data-component-line") || "";
    return {
        filePath: s || "",
        lineNumber: parseInt(r, 10) || 0,
        col: 0
    }
}
  , R = e => {
    let t = e.getAttribute("data-lov-id") || ""
      , {filePath: s, lineNumber: r, col: o} = U(t)
      , d = e.tagName.toLowerCase()
      , a = e.getAttribute("data-component-content") || null
      , T = Array.from(e.children).filter(i => N(i) && L(i).filePath !== s).filter( (i, E, b) => E === b.findIndex(O => L(O).filePath === L(i).filePath)).map(i => ({
        id: i.getAttribute("data-lov-id") || "",
        filePath: L(i).filePath,
        fileName: L(i).filePath?.split?.("/").pop() || "",
        lineNumber: L(i).lineNumber,
        col: L(i).col,
        elementType: i.tagName.toLowerCase(),
        content: i.getAttribute("data-component-content") || "",
        className: i.getAttribute("class") || "",
        textContent: i.innerText,
        attrs: {
            src: i.getAttribute("src") || ""
        }
    }));
    return {
        id: e.getAttribute("data-lov-id") || "",
        filePath: L(e).filePath,
        fileName: L(e).filePath?.split?.("/").pop() || "",
        lineNumber: L(e).lineNumber,
        col: L(e).col,
        elementType: d,
        content: a || "",
        children: T,
        className: e.getAttribute("class") || "",
        textContent: e.innerText,
        attrs: {
            src: e.getAttribute("src") || ""
        }
    }
}
  , G = () => {
    class e {
        constructor() {
            this.hoveredElement = null,
            this.isActive = !1,
            this.tooltip = null,
            this.scrollTimeout = null,
            this.mouseX = 0,
            this.mouseY = 0,
            this.styleElement = null
        }
        reset() {
            this.hoveredElement = null,
            this.scrollTimeout = null
        }
    }
    let t = new e
      , s = (n, u) => {
        let g = null;
        return (...l) => {
            g && clearTimeout(g),
            g = setTimeout( () => n(...l), u)
        }
    }
    ;
    F();
    let r = () => {
        t.tooltip = document.createElement("div"),
        t.tooltip.className = "gpt-selector-tooltip",
        t.tooltip.setAttribute("role", "tooltip"),
        document.body.appendChild(t.tooltip);
        let n = document.createElement("style");
        n.textContent = `
        .gpt-selector-tooltip {
          position: fixed;
          z-index: ${c.Z_INDEX};
          pointer-events: none;
          background-color: ${c.HIGHLIGHT_COLOR};
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
          white-space: nowrap;
          display: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: opacity 0.2s ease-in-out;
          margin: 0;
        }
        [${c.HOVERED_ATTR}] {
          position: relative;
        }
        [${c.HOVERED_ATTR}]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0px;
          outline: 1px dashed ${c.HIGHLIGHT_COLOR} !important;
          outline-offset: ${c.HIGHLIGHT_STYLE.NORMAL.OFFSET} !important;
          background-color: ${c.HIGHLIGHT_BG} !important;
          z-index: ${c.Z_INDEX};
          pointer-events: none;
        }

        [${c.SELECTED_ATTR}] {
          position: relative;
        }
        [${c.SELECTED_ATTR}]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0px;
          outline: 1px dashed ${c.HIGHLIGHT_COLOR} !important;
          outline-offset: 3px !important;
          transition: outline-offset 0.2s ease-in-out;
          z-index: ${c.Z_INDEX};
          pointer-events: none;
        }

        [${c.SELECTED_ATTR}][contenteditable] {
          outline: none !important;
        }

        [${c.HOVERED_ATTR}][data-full-width]::before,
        [${c.SELECTED_ATTR}][data-full-width]::before {
          outline-offset: ${c.HIGHLIGHT_STYLE.FULL_WIDTH.OFFSET} !important;
        }
      `,
        document.head.appendChild(n)
    }
      , o = n => {
        if (!(!t.tooltip || !n))
            try {
                let u = n.getBoundingClientRect()
                  , g = n.tagName.toLowerCase()
                  , l = Math.abs(u.width - window.innerWidth) < 5;
                if (t.tooltip.style.maxWidth = `${c.MAX_TOOLTIP_WIDTH}px`,
                l)
                    t.tooltip.style.left = c.FULL_WIDTH_TOOLTIP_OFFSET,
                    t.tooltip.style.top = c.FULL_WIDTH_TOOLTIP_OFFSET;
                else {
                    let p = Math.max(0, u.top - c.TOOLTIP_OFFSET);
                    t.tooltip.style.left = `${Math.max(0, u.left)}px`,
                    t.tooltip.style.top = `${p}px`
                }
                t.tooltip.textContent = g
            } catch (u) {
                console.error("Error updating tooltip:", u),
                b()
            }
    }
      , d = n => {
        let u = Math.abs(n.getBoundingClientRect().width - window.innerWidth) < 5;
        n.setAttribute(c.HOVERED_ATTR, "true"),
        u && n.setAttribute("data-full-width", "true")
    }
      , a = n => {
        n.removeAttribute(c.HOVERED_ATTR),
        n.removeAttribute("data-full-width"),
        n.style.cursor = ""
    }
      , T = n => {
        let u = n.tagName.toLowerCase() === "svg"
          , g = n.closest("svg") !== null;
        return !u && g
    }
      , i = s(n => {
        if (!t.isActive || !N(n.target) || n.target.tagName.toLowerCase() === "html" || T(n.target))
            return;
        t.hoveredElement && w(L(t.hoveredElement)).forEach(l => {
            l.classList.contains("gpt-selected-element") || a(l)
        }
        ),
        t.hoveredElement = n.target,
        (t.hoveredElement && w(L(t.hoveredElement)))?.forEach(g => {
            g.classList.contains("gpt-selected-element") || d(g)
        }
        ),
        o(t.hoveredElement),
        t.tooltip && (t.tooltip.style.display = "block",
        t.tooltip.style.opacity = "1")
    }
    , c.DEBOUNCE_DELAY)
      , E = s( () => {
        t.isActive && (t.hoveredElement && ((t.hoveredElement && w(L(t.hoveredElement)))?.forEach(u => {
            u.removeAttribute(c.HOVERED_ATTR),
            u.hasAttribute(c.SELECTED_ATTR) || a(u)
        }
        ),
        t.hoveredElement = null),
        b())
    }
    , c.DEBOUNCE_DELAY)
      , b = () => {
        t.tooltip && (t.tooltip.style.opacity = "0",
        t.tooltip.style.display = "none")
    }
      , O = () => {
        t.scrollTimeout && clearTimeout(t.scrollTimeout),
        b(),
        t.hoveredElement && !t.hoveredElement.classList.contains("gpt-selected-element") && a(t.hoveredElement),
        t.scrollTimeout = setTimeout( () => {
            t.scrollTimeout = null;
            let n = document.elementFromPoint(t.mouseX, t.mouseY);
            n && t.isActive && i({
                target: n
            })
        }
        , c.SCROLL_DEBOUNCE)
    }
      , D = n => {
        t.isActive && n.target && n.target instanceof HTMLElement && ["input", "textarea", "select"].includes(n.target.tagName.toLowerCase()) && n.preventDefault()
    }
      , S = n => {
        if (t.isActive)
            return n.preventDefault(),
            n.stopPropagation(),
            !1
    }
      , K = () => {
        document.addEventListener("mouseover", i),
        document.addEventListener("mouseout", E),
        document.addEventListener("click", I, !0),
        document.addEventListener("dblclick", W, !0),
        window.addEventListener("scroll", O, {
            passive: !0
        }),
        document.addEventListener("mousedown", D, !0);
        let n = document.createElement("style");
        n.textContent = `
        * {
          scroll-behavior: auto !important;
        }
      `,
        document.head.appendChild(n),
        t.styleElement = n,
        document.addEventListener("click", S, !0),
        document.addEventListener("submit", S, !0),
        document.addEventListener("touchstart", S, !0),
        document.addEventListener("touchend", S, !0)
    }
      , x = () => {
        document.removeEventListener("mouseover", i),
        document.removeEventListener("mouseout", E),
        document.removeEventListener("click", I),
        window.removeEventListener("scroll", O),
        document.removeEventListener("mousedown", D, !0),
        document.removeEventListener("click", S, !0),
        document.removeEventListener("submit", S, !0),
        document.removeEventListener("touchstart", S, !0),
        document.removeEventListener("touchend", S, !0),
        t.styleElement && (t.styleElement.remove(),
        t.styleElement = null),
        document.body.style.cursor = "",
        document.body.style.userSelect = "",
        document.body.style.msUserSelect = "",
        document.body.style.mozUserSelect = "",
        t.hoveredElement && (t.hoveredElement.hasAttribute(c.SELECTED_ATTR) || a(t.hoveredElement),
        t.hoveredElement = null),
        b()
    }
      , w = n => {
        let u = `[data-lov-id="${n.filePath}:${n.lineNumber}:${n.col || "0"}"]`
          , g = document.querySelectorAll(u);
        if (g.length > 0)
            return g;
        let l = `[data-component-path="${n.filePath}"][data-component-line="${n.lineNumber}"]`;
        return document.querySelectorAll(l)
    }
      , j = n => {
        try {
            if (!n?.origin || !n?.data?.type || !c.ALLOWED_ORIGINS.includes(n.origin))
                return;
            switch (n.data.type) {
            case "TOGGLE_SELECTOR":
                let u = !!n.data.payload;
                t.isActive !== u && (t.isActive = u,
                t.isActive ? (K(),
                C().then( () => {
                    document.querySelectorAll("button[disabled]").forEach(l => {
                        l.removeAttribute("disabled"),
                        l.setAttribute("data-lov-disabled", "")
                    }
                    )
                }
                )) : (x(),
                document.querySelectorAll("[data-lov-disabled]").forEach(p => {
                    p.removeAttribute("data-lov-disabled"),
                    p.setAttribute("disabled", "")
                }
                ),
                document.querySelectorAll(`[${c.HOVERED_ATTR}], [data-full-width]`).forEach(p => {
                    p.hasAttribute(c.SELECTED_ATTR) || (a(p),
                    p instanceof HTMLElement && (p.style.cursor = ""))
                }
                ),
                t.reset()));
                break;
            case "UPDATE_SELECTED_ELEMENTS":
                if (!Array.isArray(n.data.payload)) {
                    console.error("Invalid payload for UPDATE_SELECTED_ELEMENTS");
                    return
                }
                document.querySelectorAll(`[${c.SELECTED_ATTR}], [${c.HOVERED_ATTR}]`).forEach(l => {
                    l.removeAttribute(c.SELECTED_ATTR),
                    l.removeAttribute(c.HOVERED_ATTR),
                    l.removeAttribute("data-full-width")
                }
                ),
                n.data.payload.forEach(l => {
                    if (!l?.filePath || !l?.lineNumber) {
                        console.error("Invalid element data:", l);
                        return
                    }
                    w({
                        filePath: l.filePath,
                        lineNumber: l.lineNumber,
                        col: l.col
                    }).forEach(m => {
                        m.setAttribute(c.SELECTED_ATTR, "true"),
                        Math.abs(m.getBoundingClientRect().width - window.innerWidth) < 5 && m.setAttribute("data-full-width", "true")
                    }
                    )
                }
                );
                break;
            case "GET_SELECTOR_STATE":
                f({
                    type: "SELECTOR_STATE_RESPONSE",
                    payload: {
                        isActive: t.isActive
                    }
                });
                break;
            case "SET_ELEMENT_CONTENT":
                {
                    let {id: l, content: p} = n.data.payload;
                    w({
                        filePath: l.path,
                        lineNumber: l.line
                    }).forEach(h => {
                        h.innerHTML = p
                    }
                    )
                }
                break;
            case "SET_ELEMENT_ATTRS":
                {
                    let {id: l, attrs: p} = n.data.payload;
                    w({
                        filePath: l.path,
                        lineNumber: l.line
                    }).forEach(h => {
                        Object.keys(p).forEach(_ => {
                            h.setAttribute(_, p[_])
                        }
                        )
                    }
                    )
                }
                break;
            case "DUPLICATE_ELEMENT_REQUESTED":
                {
                    let {id: l} = n.data.payload;
                    w({
                        filePath: l.path,
                        lineNumber: l.line
                    }).forEach(m => {
                        let h = m.cloneNode(!0);
                        h.setAttribute("data-lov-id", "x"),
                        h.setAttribute("data-lov-tmp", "true"),
                        m.parentElement?.appendChild(h)
                    }
                    );
                    break
                }
            case "SET_STYLESHEET":
                {
                    let {stylesheet: l} = n.data.payload
                      , p = document.getElementById(c.OVERRIDE_STYLESHEET_ID);
                    if (p)
                        p.innerHTML = l;
                    else {
                        let m = document.getElementsByTagName("head")[0]
                          , h = document.createElement("style");
                        h.id = c.OVERRIDE_STYLESHEET_ID,
                        h.innerHTML = l,
                        m.appendChild(h)
                    }
                    break
                }
            case "EDIT_TEXT_REQUESTED":
                {
                    let {id: l} = n.data.payload;
                    w({
                        filePath: l.path,
                        lineNumber: l.line
                    }).forEach(m => {
                        if (!(m instanceof HTMLElement))
                            return;
                        m.setAttribute("contenteditable", "true"),
                        m.focus();
                        let h = () => {
                            f({
                                type: "ELEMENT_TEXT_UPDATED",
                                payload: {
                                    id: l,
                                    content: m.innerText
                                }
                            })
                        }
                          , _ = () => {
                            m.removeAttribute("contenteditable"),
                            m.removeEventListener("input", h),
                            m.removeEventListener("blur", _)
                        }
                        ;
                        m.addEventListener("input", h),
                        m.addEventListener("blur", _)
                    }
                    );
                    break
                }
            case "HOVER_ELEMENT_REQUESTED":
                {
                    let {id: l} = n.data.payload;
                    document.querySelectorAll(`[${c.HOVERED_ATTR}]`).forEach(m => {
                        m.removeAttribute(c.HOVERED_ATTR)
                    }
                    ),
                    w({
                        filePath: l.path,
                        lineNumber: l.line
                    }).forEach(m => {
                        m.setAttribute(c.HOVERED_ATTR, "true")
                    }
                    );
                    break
                }
            case "UNHOVER_ELEMENT_REQUESTED":
                {
                    let {id: l} = n.data.payload;
                    w({
                        filePath: l.path,
                        lineNumber: l.line
                    }).forEach(m => {
                        m.removeAttribute(c.HOVERED_ATTR)
                    }
                    );
                    break
                }
            case "GET_PARENT_ELEMENT":
                {
                    let {id: l} = n.data.payload
                      , h = w({
                        filePath: l.path,
                        lineNumber: l.line
                    })[0].parentElement;
                    !h || h.id === "root" || ["HTML", "BODY"].includes(h.tagName) ? f({
                        type: "PARENT_ELEMENT",
                        payload: null
                    }) : f({
                        type: "PARENT_ELEMENT",
                        payload: R(h)
                    });
                    break
                }
            case "REQUEST_COMPONENT_TREE":
                $();
                break;
            default:
                console.warn("Unknown message type:", n.data.type)
            }
        } catch (u) {
            console.error("Error handling message:", u),
            x(),
            t.reset()
        }
    }
      , B = n => {
        t.mouseX = n.clientX,
        t.mouseY = n.clientY
    }
      , V = () => {
        f({
            type: "REQUEST_PICKER_STATE"
        }),
        f({
            type: "REQUEST_SELECTED_ELEMENTS"
        })
    }
    ;
    ( () => {
        try {
            r(),
            window.addEventListener("message", j),
            document.addEventListener("mousemove", B),
            f({
                type: "SELECTOR_SCRIPT_LOADED",
                payload: {
                    version: window.LOV_SELECTOR_SCRIPT_VERSION
                }
            }),
            C().then( () => {
                V()
            }
            )
        } catch (n) {
            console.error("Failed to initialize selector script:", n)
        }
    }
    )();
    let I = n => {
        if (t.isActive && !(!N(n.target) || n.target.tagName.toLowerCase() === "html" || T(n.target)) && (n.preventDefault(),
        n.stopPropagation(),
        t.hoveredElement)) {
            let u = R(t.hoveredElement);
            t.hoveredElement.setAttribute(c.SELECTED_ATTR, "true"),
            Math.abs(t.hoveredElement.getBoundingClientRect().width - window.innerWidth) < 5 && t.hoveredElement.setAttribute("data-full-width", "true"),
            f({
                type: "ELEMENT_CLICKED",
                payload: u,
                isMultiSelect: n.metaKey || n.ctrlKey
            })
        }
    }
      , W = n => {
        if (!t.isActive || !N(n.target) || n.target.tagName.toLowerCase() === "html" || T(n.target))
            return;
        n.preventDefault(),
        n.stopPropagation();
        let u = R(n.target);
        f({
            type: "ELEMENT_DOUBLE_CLICKED",
            payload: u
        })
    }
}
;
var ee = () => {
    if (window.location.search.includes("lov-override-script")) {
        let e = "http://localhost:8001/gptengineer.js";
        console.log("Overriding gptengineer.js script with:", e);
        let t = document.createElement("script");
        t.type = "module",
        t.src = e,
        document.body.appendChild(t);
        return
    }
    window.top !== window.self && (M(),
    P(),
    k(),
    G())
}
;
ee();
