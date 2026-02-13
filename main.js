var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BlogPublisherPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/PublishView.tsx
var import_obsidian = require("obsidian");

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var o;
var r;
var e;
var f;
var c;
var s;
var a;
var h;
var p = {};
var v = [];
var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var d = Array.isArray;
function w(n2, l3) {
  for (var u3 in l3)
    n2[u3] = l3[u3];
  return n2;
}
function g(n2) {
  n2 && n2.parentNode && n2.parentNode.removeChild(n2);
}
function _(l3, u3, t3) {
  var i3, o3, r3, e3 = {};
  for (r3 in u3)
    "key" == r3 ? i3 = u3[r3] : "ref" == r3 ? o3 = u3[r3] : e3[r3] = u3[r3];
  if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps)
    for (r3 in l3.defaultProps)
      void 0 === e3[r3] && (e3[r3] = l3.defaultProps[r3]);
  return m(l3, e3, i3, o3, null);
}
function m(n2, t3, i3, o3, r3) {
  var e3 = { type: n2, props: t3, key: i3, ref: o3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == r3 ? ++u : r3, __i: -1, __u: 0 };
  return null == r3 && null != l.vnode && l.vnode(e3), e3;
}
function k(n2) {
  return n2.children;
}
function x(n2, l3) {
  this.props = n2, this.context = l3;
}
function S(n2, l3) {
  if (null == l3)
    return n2.__ ? S(n2.__, n2.__i + 1) : null;
  for (var u3; l3 < n2.__k.length; l3++)
    if (null != (u3 = n2.__k[l3]) && null != u3.__e)
      return u3.__e;
  return "function" == typeof n2.type ? S(n2) : null;
}
function C(n2) {
  var l3, u3;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++)
      if (null != (u3 = n2.__k[l3]) && null != u3.__e) {
        n2.__e = n2.__c.base = u3.__e;
        break;
      }
    return C(n2);
  }
}
function M(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !$.__r++ || o != l.debounceRendering) && ((o = l.debounceRendering) || r)($);
}
function $() {
  for (var n2, u3, t3, o3, r3, f3, c3, s3 = 1; i.length; )
    i.length > s3 && i.sort(e), n2 = i.shift(), s3 = i.length, n2.__d && (t3 = void 0, o3 = void 0, r3 = (o3 = (u3 = n2).__v).__e, f3 = [], c3 = [], u3.__P && ((t3 = w({}, o3)).__v = o3.__v + 1, l.vnode && l.vnode(t3), O(u3.__P, t3, o3, u3.__n, u3.__P.namespaceURI, 32 & o3.__u ? [r3] : null, f3, null == r3 ? S(o3) : r3, !!(32 & o3.__u), c3), t3.__v = o3.__v, t3.__.__k[t3.__i] = t3, N(f3, t3, c3), o3.__e = o3.__ = null, t3.__e != r3 && C(t3)));
  $.__r = 0;
}
function I(n2, l3, u3, t3, i3, o3, r3, e3, f3, c3, s3) {
  var a3, h3, y3, d3, w3, g2, _2, m3 = t3 && t3.__k || v, b = l3.length;
  for (f3 = P(u3, l3, m3, f3, b), a3 = 0; a3 < b; a3++)
    null != (y3 = u3.__k[a3]) && (h3 = -1 == y3.__i ? p : m3[y3.__i] || p, y3.__i = a3, g2 = O(n2, y3, h3, i3, o3, r3, e3, f3, c3, s3), d3 = y3.__e, y3.ref && h3.ref != y3.ref && (h3.ref && B(h3.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w3 && null != d3 && (w3 = d3), (_2 = !!(4 & y3.__u)) || h3.__k === y3.__k ? f3 = A(y3, f3, n2, _2) : "function" == typeof y3.type && void 0 !== g2 ? f3 = g2 : d3 && (f3 = d3.nextSibling), y3.__u &= -7);
  return u3.__e = w3, f3;
}
function P(n2, l3, u3, t3, i3) {
  var o3, r3, e3, f3, c3, s3 = u3.length, a3 = s3, h3 = 0;
  for (n2.__k = new Array(i3), o3 = 0; o3 < i3; o3++)
    null != (r3 = l3[o3]) && "boolean" != typeof r3 && "function" != typeof r3 ? ("string" == typeof r3 || "number" == typeof r3 || "bigint" == typeof r3 || r3.constructor == String ? r3 = n2.__k[o3] = m(null, r3, null, null, null) : d(r3) ? r3 = n2.__k[o3] = m(k, { children: r3 }, null, null, null) : void 0 === r3.constructor && r3.__b > 0 ? r3 = n2.__k[o3] = m(r3.type, r3.props, r3.key, r3.ref ? r3.ref : null, r3.__v) : n2.__k[o3] = r3, f3 = o3 + h3, r3.__ = n2, r3.__b = n2.__b + 1, e3 = null, -1 != (c3 = r3.__i = L(r3, u3, f3, a3)) && (a3--, (e3 = u3[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i3 > s3 ? h3-- : i3 < s3 && h3++), "function" != typeof r3.type && (r3.__u |= 4)) : c3 != f3 && (c3 == f3 - 1 ? h3-- : c3 == f3 + 1 ? h3++ : (c3 > f3 ? h3-- : h3++, r3.__u |= 4))) : n2.__k[o3] = null;
  if (a3)
    for (o3 = 0; o3 < s3; o3++)
      null != (e3 = u3[o3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = S(e3)), D(e3, e3));
  return t3;
}
function A(n2, l3, u3, t3) {
  var i3, o3;
  if ("function" == typeof n2.type) {
    for (i3 = n2.__k, o3 = 0; i3 && o3 < i3.length; o3++)
      i3[o3] && (i3[o3].__ = n2, l3 = A(i3[o3], l3, u3, t3));
    return l3;
  }
  n2.__e != l3 && (t3 && (l3 && n2.type && !l3.parentNode && (l3 = S(n2)), u3.insertBefore(n2.__e, l3 || null)), l3 = n2.__e);
  do {
    l3 = l3 && l3.nextSibling;
  } while (null != l3 && 8 == l3.nodeType);
  return l3;
}
function L(n2, l3, u3, t3) {
  var i3, o3, r3, e3 = n2.key, f3 = n2.type, c3 = l3[u3], s3 = null != c3 && 0 == (2 & c3.__u);
  if (null === c3 && null == e3 || s3 && e3 == c3.key && f3 == c3.type)
    return u3;
  if (t3 > (s3 ? 1 : 0)) {
    for (i3 = u3 - 1, o3 = u3 + 1; i3 >= 0 || o3 < l3.length; )
      if (null != (c3 = l3[r3 = i3 >= 0 ? i3-- : o3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f3 == c3.type)
        return r3;
  }
  return -1;
}
function T(n2, l3, u3) {
  "-" == l3[0] ? n2.setProperty(l3, null == u3 ? "" : u3) : n2[l3] = null == u3 ? "" : "number" != typeof u3 || y.test(l3) ? u3 : u3 + "px";
}
function j(n2, l3, u3, t3, i3) {
  var o3, r3;
  n:
    if ("style" == l3)
      if ("string" == typeof u3)
        n2.style.cssText = u3;
      else {
        if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3)
          for (l3 in t3)
            u3 && l3 in u3 || T(n2.style, l3, "");
        if (u3)
          for (l3 in u3)
            t3 && u3[l3] == t3[l3] || T(n2.style, l3, u3[l3]);
      }
    else if ("o" == l3[0] && "n" == l3[1])
      o3 = l3 != (l3 = l3.replace(f, "$1")), r3 = l3.toLowerCase(), l3 = r3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? r3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + o3] = u3, u3 ? t3 ? u3.u = t3.u : (u3.u = c, n2.addEventListener(l3, o3 ? a : s, o3)) : n2.removeEventListener(l3, o3 ? a : s, o3);
    else {
      if ("http://www.w3.org/2000/svg" == i3)
        l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2)
        try {
          n2[l3] = null == u3 ? "" : u3;
          break n;
        } catch (n3) {
        }
      "function" == typeof u3 || (null == u3 || false === u3 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u3 ? "" : u3));
    }
}
function F(n2) {
  return function(u3) {
    if (this.l) {
      var t3 = this.l[u3.type + n2];
      if (null == u3.t)
        u3.t = c++;
      else if (u3.t < t3.u)
        return;
      return t3(l.event ? l.event(u3) : u3);
    }
  };
}
function O(n2, u3, t3, i3, o3, r3, e3, f3, c3, s3) {
  var a3, h3, p3, v3, y3, _2, m3, b, S2, C3, M2, $2, P2, A3, H, L2, T3, j3 = u3.type;
  if (void 0 !== u3.constructor)
    return null;
  128 & t3.__u && (c3 = !!(32 & t3.__u), r3 = [f3 = u3.__e = t3.__e]), (a3 = l.__b) && a3(u3);
  n:
    if ("function" == typeof j3)
      try {
        if (b = u3.props, S2 = "prototype" in j3 && j3.prototype.render, C3 = (a3 = j3.contextType) && i3[a3.__c], M2 = a3 ? C3 ? C3.props.value : a3.__ : i3, t3.__c ? m3 = (h3 = u3.__c = t3.__c).__ = h3.__E : (S2 ? u3.__c = h3 = new j3(b, M2) : (u3.__c = h3 = new x(b, M2), h3.constructor = j3, h3.render = E), C3 && C3.sub(h3), h3.state || (h3.state = {}), h3.__n = i3, p3 = h3.__d = true, h3.__h = [], h3._sb = []), S2 && null == h3.__s && (h3.__s = h3.state), S2 && null != j3.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = w({}, h3.__s)), w(h3.__s, j3.getDerivedStateFromProps(b, h3.__s))), v3 = h3.props, y3 = h3.state, h3.__v = u3, p3)
          S2 && null == j3.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), S2 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
        else {
          if (S2 && null == j3.getDerivedStateFromProps && b !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(b, M2), u3.__v == t3.__v || !h3.__e && null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(b, h3.__s, M2)) {
            for (u3.__v != t3.__v && (h3.props = b, h3.state = h3.__s, h3.__d = false), u3.__e = t3.__e, u3.__k = t3.__k, u3.__k.some(function(n3) {
              n3 && (n3.__ = u3);
            }), $2 = 0; $2 < h3._sb.length; $2++)
              h3.__h.push(h3._sb[$2]);
            h3._sb = [], h3.__h.length && e3.push(h3);
            break n;
          }
          null != h3.componentWillUpdate && h3.componentWillUpdate(b, h3.__s, M2), S2 && null != h3.componentDidUpdate && h3.__h.push(function() {
            h3.componentDidUpdate(v3, y3, _2);
          });
        }
        if (h3.context = M2, h3.props = b, h3.__P = n2, h3.__e = false, P2 = l.__r, A3 = 0, S2) {
          for (h3.state = h3.__s, h3.__d = false, P2 && P2(u3), a3 = h3.render(h3.props, h3.state, h3.context), H = 0; H < h3._sb.length; H++)
            h3.__h.push(h3._sb[H]);
          h3._sb = [];
        } else
          do {
            h3.__d = false, P2 && P2(u3), a3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
          } while (h3.__d && ++A3 < 25);
        h3.state = h3.__s, null != h3.getChildContext && (i3 = w(w({}, i3), h3.getChildContext())), S2 && !p3 && null != h3.getSnapshotBeforeUpdate && (_2 = h3.getSnapshotBeforeUpdate(v3, y3)), L2 = a3, null != a3 && a3.type === k && null == a3.key && (L2 = V(a3.props.children)), f3 = I(n2, d(L2) ? L2 : [L2], u3, t3, i3, o3, r3, e3, f3, c3, s3), h3.base = u3.__e, u3.__u &= -161, h3.__h.length && e3.push(h3), m3 && (h3.__E = h3.__ = null);
      } catch (n3) {
        if (u3.__v = null, c3 || null != r3)
          if (n3.then) {
            for (u3.__u |= c3 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; )
              f3 = f3.nextSibling;
            r3[r3.indexOf(f3)] = null, u3.__e = f3;
          } else {
            for (T3 = r3.length; T3--; )
              g(r3[T3]);
            z(u3);
          }
        else
          u3.__e = t3.__e, u3.__k = t3.__k, n3.then || z(u3);
        l.__e(n3, u3, t3);
      }
    else
      null == r3 && u3.__v == t3.__v ? (u3.__k = t3.__k, u3.__e = t3.__e) : f3 = u3.__e = q(t3.__e, u3, t3, i3, o3, r3, e3, c3, s3);
  return (a3 = l.diffed) && a3(u3), 128 & u3.__u ? void 0 : f3;
}
function z(n2) {
  n2 && n2.__c && (n2.__c.__e = true), n2 && n2.__k && n2.__k.forEach(z);
}
function N(n2, u3, t3) {
  for (var i3 = 0; i3 < t3.length; i3++)
    B(t3[i3], t3[++i3], t3[++i3]);
  l.__c && l.__c(u3, n2), n2.some(function(u4) {
    try {
      n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
        n3.call(u4);
      });
    } catch (n3) {
      l.__e(n3, u4.__v);
    }
  });
}
function V(n2) {
  return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : d(n2) ? n2.map(V) : w({}, n2);
}
function q(u3, t3, i3, o3, r3, e3, f3, c3, s3) {
  var a3, h3, v3, y3, w3, _2, m3, b = i3.props || p, k3 = t3.props, x2 = t3.type;
  if ("svg" == x2 ? r3 = "http://www.w3.org/2000/svg" : "math" == x2 ? r3 = "http://www.w3.org/1998/Math/MathML" : r3 || (r3 = "http://www.w3.org/1999/xhtml"), null != e3) {
    for (a3 = 0; a3 < e3.length; a3++)
      if ((w3 = e3[a3]) && "setAttribute" in w3 == !!x2 && (x2 ? w3.localName == x2 : 3 == w3.nodeType)) {
        u3 = w3, e3[a3] = null;
        break;
      }
  }
  if (null == u3) {
    if (null == x2)
      return document.createTextNode(k3);
    u3 = document.createElementNS(r3, x2, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
  }
  if (null == x2)
    b === k3 || c3 && u3.data == k3 || (u3.data = k3);
  else {
    if (e3 = e3 && n.call(u3.childNodes), !c3 && null != e3)
      for (b = {}, a3 = 0; a3 < u3.attributes.length; a3++)
        b[(w3 = u3.attributes[a3]).name] = w3.value;
    for (a3 in b)
      if (w3 = b[a3], "children" == a3)
        ;
      else if ("dangerouslySetInnerHTML" == a3)
        v3 = w3;
      else if (!(a3 in k3)) {
        if ("value" == a3 && "defaultValue" in k3 || "checked" == a3 && "defaultChecked" in k3)
          continue;
        j(u3, a3, null, w3, r3);
      }
    for (a3 in k3)
      w3 = k3[a3], "children" == a3 ? y3 = w3 : "dangerouslySetInnerHTML" == a3 ? h3 = w3 : "value" == a3 ? _2 = w3 : "checked" == a3 ? m3 = w3 : c3 && "function" != typeof w3 || b[a3] === w3 || j(u3, a3, w3, b[a3], r3);
    if (h3)
      c3 || v3 && (h3.__html == v3.__html || h3.__html == u3.innerHTML) || (u3.innerHTML = h3.__html), t3.__k = [];
    else if (v3 && (u3.innerHTML = ""), I("template" == t3.type ? u3.content : u3, d(y3) ? y3 : [y3], t3, i3, o3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : r3, e3, f3, e3 ? e3[0] : i3.__k && S(i3, 0), c3, s3), null != e3)
      for (a3 = e3.length; a3--; )
        g(e3[a3]);
    c3 || (a3 = "value", "progress" == x2 && null == _2 ? u3.removeAttribute("value") : null != _2 && (_2 !== u3[a3] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a3]) && j(u3, a3, _2, b[a3], r3), a3 = "checked", null != m3 && m3 != u3[a3] && j(u3, a3, m3, b[a3], r3));
  }
  return u3;
}
function B(n2, u3, t3) {
  try {
    if ("function" == typeof n2) {
      var i3 = "function" == typeof n2.__u;
      i3 && n2.__u(), i3 && null == u3 || (n2.__u = n2(u3));
    } else
      n2.current = u3;
  } catch (n3) {
    l.__e(n3, t3);
  }
}
function D(n2, u3, t3) {
  var i3, o3;
  if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current != n2.__e || B(i3, null, u3)), null != (i3 = n2.__c)) {
    if (i3.componentWillUnmount)
      try {
        i3.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u3);
      }
    i3.base = i3.__P = null;
  }
  if (i3 = n2.__k)
    for (o3 = 0; o3 < i3.length; o3++)
      i3[o3] && D(i3[o3], u3, t3 || "function" != typeof n2.type);
  t3 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
}
function E(n2, l3, u3) {
  return this.constructor(n2, u3);
}
function G(u3, t3, i3) {
  var o3, r3, e3, f3;
  t3 == document && (t3 = document.documentElement), l.__ && l.__(u3, t3), r3 = (o3 = "function" == typeof i3) ? null : i3 && i3.__k || t3.__k, e3 = [], f3 = [], O(t3, u3 = (!o3 && i3 || t3).__k = _(k, null, [u3]), r3 || p, p, t3.namespaceURI, !o3 && i3 ? [i3] : r3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !o3 && i3 ? i3 : r3 ? r3.__e : t3.firstChild, o3, f3), N(e3, u3, f3);
}
n = v.slice, l = { __e: function(n2, l3, u3, t3) {
  for (var i3, o3, r3; l3 = l3.__; )
    if ((i3 = l3.__c) && !i3.__)
      try {
        if ((o3 = i3.constructor) && null != o3.getDerivedStateFromError && (i3.setState(o3.getDerivedStateFromError(n2)), r3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t3 || {}), r3 = i3.__d), r3)
          return i3.__E = i3;
      } catch (l4) {
        n2 = l4;
      }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && void 0 === n2.constructor;
}, x.prototype.setState = function(n2, l3) {
  var u3;
  u3 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n2 && (n2 = n2(w({}, u3), this.props)), n2 && w(u3, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), M(this));
}, x.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
}, x.prototype.render = k, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = F(false), a = F(true), h = 0;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = l;
var e2 = c2.__b;
var a2 = c2.__r;
var v2 = c2.diffed;
var l2 = c2.__c;
var m2 = c2.unmount;
var s2 = c2.__;
function p2(n2, t3) {
  c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
  var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
  return n2 >= u3.__.length && u3.__.push({}), u3.__[n2];
}
function d2(n2) {
  return o2 = 1, h2(D2, n2);
}
function h2(n2, u3, i3) {
  var o3 = p2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(void 0, u3), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.__f)) {
    var f3 = function(n3, t3, r3) {
      if (!o3.__c.__H)
        return true;
      var u4 = o3.__c.__H.__.filter(function(n4) {
        return !!n4.__c;
      });
      if (u4.every(function(n4) {
        return !n4.__N;
      }))
        return !c3 || c3.call(this, n3, t3, r3);
      var i4 = o3.__c.props !== n3;
      return u4.forEach(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
        }
      }), c3 && c3.call(this, n3, t3, r3) || i4;
    };
    r2.__f = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u4 = c3;
        c3 = void 0, f3(n3, t3, r3), c3 = u4;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f3;
  }
  return o3.__N || o3.__;
}
function y2(n2, u3) {
  var i3 = p2(t2++, 3);
  !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__H.__h.push(i3));
}
function A2(n2) {
  return o2 = 5, T2(function() {
    return { current: n2 };
  }, []);
}
function T2(n2, r3) {
  var u3 = p2(t2++, 7);
  return C2(u3.__H, r3) && (u3.__ = n2(), u3.__H = r3, u3.__h = n2), u3.__;
}
function q2(n2, t3) {
  return o2 = 8, T2(function() {
    return n2;
  }, t3);
}
function j2() {
  for (var n2; n2 = f2.shift(); )
    if (n2.__P && n2.__H)
      try {
        n2.__H.__h.forEach(z2), n2.__H.__h.forEach(B2), n2.__H.__h = [];
      } catch (t3) {
        n2.__H.__h = [], c2.__e(t3, n2.__v);
      }
}
c2.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, c2.__ = function(n2, t3) {
  n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
}, c2.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
  })) : (i3.__h.forEach(z2), i3.__h.forEach(B2), i3.__h = [], t2 = 0)), u2 = r2;
}, c2.diffed = function(n2) {
  v2 && v2(n2);
  var t3 = n2.__c;
  t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.forEach(function(n3) {
    n3.u && (n3.__H = n3.u), n3.u = void 0;
  })), u2 = r2 = null;
}, c2.__c = function(n2, t3) {
  t3.some(function(n3) {
    try {
      n3.__h.forEach(z2), n3.__h = n3.__h.filter(function(n4) {
        return !n4.__ || B2(n4);
      });
    } catch (r3) {
      t3.some(function(n4) {
        n4.__h && (n4.__h = []);
      }), t3 = [], c2.__e(r3, n3.__v);
    }
  }), l2 && l2(n2, t3);
}, c2.unmount = function(n2) {
  m2 && m2(n2);
  var t3, r3 = n2.__c;
  r3 && r3.__H && (r3.__H.__.forEach(function(n3) {
    try {
      z2(n3);
    } catch (n4) {
      t3 = n4;
    }
  }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
};
var k2 = "function" == typeof requestAnimationFrame;
function w2(n2) {
  var t3, r3 = function() {
    clearTimeout(u3), k2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u3 = setTimeout(r3, 35);
  k2 && (t3 = requestAnimationFrame(r3));
}
function z2(n2) {
  var t3 = r2, u3 = n2.__c;
  "function" == typeof u3 && (n2.__c = void 0, u3()), r2 = t3;
}
function B2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function C2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
}
function D2(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}

// src/models/types.ts
var DEFAULT_SETTINGS = {
  githubToken: "",
  repository: "amishrobot/amishrobot.com",
  branch: "main",
  postsFolder: "Personal/Blog/posts",
  themeFilePath: "Personal/Blog/settings/theme.md",
  themeRepoPath: "content/settings/theme.md",
  themePublishedHash: "",
  themePublishedCommit: "",
  siteUrl: "https://amishrobot.com",
  themes: ["classic", "paper", "spruce", "midnight"]
};
var STATUS_CONFIG = {
  draft: { label: "Draft", color: "#e5c07b", bg: "#e5c07b20", icon: "\u25CB", desc: "Work in progress" },
  review: { label: "Review", color: "#61afef", bg: "#61afef20", icon: "\u25CE", desc: "Ready for review" },
  publish: { label: "Published", color: "#98c379", bg: "#98c37920", icon: "\u25CF", desc: "Live on site" },
  unpublish: { label: "Unpublished", color: "#e06c75", bg: "#e06c7520", icon: "\u25CB", desc: "Taken offline" }
};
var THEME_PALETTES = {
  classic: {
    label: "Classic",
    dots: ["#1a1a2e", "#e8e8e8", "#4a90d9"],
    bg: "#1e1e2e",
    bgDeep: "#16162a",
    bgSurface: "#252540",
    border: "#2e2e4a",
    borderSubtle: "#252540",
    text: "#d4d4e8",
    textMuted: "#8888aa",
    textFaint: "#555577",
    accent: "#4a90d9",
    accentBg: "#4a90d920",
    heading: "#ccccee",
    inputBg: "#1a1a30",
    inputBorder: "#333355",
    tagBg: "#2e2e50",
    tagText: "#aaaacc",
    urlColor: "#4a90d9",
    chipBorder: "#3a3a5a",
    chipSelectedBg: "#2e2e50",
    chipSelectedBorder: "#6a6a9a",
    overlayBg: "#202038",
    hoverBg: "#28284a"
  },
  paper: {
    label: "Paper",
    dots: ["#faf9f6", "#2c2c2c", "#8b7355"],
    bg: "#f5f3ee",
    bgDeep: "#eae7df",
    bgSurface: "#fff",
    border: "#ddd8cc",
    borderSubtle: "#e8e4da",
    text: "#3a3530",
    textMuted: "#8a8378",
    textFaint: "#b5ad9e",
    accent: "#8b7355",
    accentBg: "#8b735520",
    heading: "#4a4540",
    inputBg: "#faf9f6",
    inputBorder: "#d5d0c5",
    tagBg: "#e8e4da",
    tagText: "#6a6358",
    urlColor: "#8b7355",
    chipBorder: "#d5d0c5",
    chipSelectedBg: "#e8e4da",
    chipSelectedBorder: "#8b7355",
    overlayBg: "#f0ede6",
    hoverBg: "#ece8e0"
  },
  spruce: {
    label: "Spruce",
    dots: ["#1b2a1b", "#d4e4d4", "#5a8a5a"],
    bg: "#1a2a1a",
    bgDeep: "#142014",
    bgSurface: "#223322",
    border: "#2a3f2a",
    borderSubtle: "#223322",
    text: "#c8dcc8",
    textMuted: "#7a9a7a",
    textFaint: "#4a6a4a",
    accent: "#5a8a5a",
    accentBg: "#5a8a5a20",
    heading: "#b8d4b8",
    inputBg: "#162016",
    inputBorder: "#2a4a2a",
    tagBg: "#223a22",
    tagText: "#8ab88a",
    urlColor: "#6aaa6a",
    chipBorder: "#2a4a2a",
    chipSelectedBg: "#223a22",
    chipSelectedBorder: "#5a8a5a",
    overlayBg: "#1e2e1e",
    hoverBg: "#243824"
  },
  midnight: {
    label: "Midnight",
    dots: ["#0d1117", "#c9d1d9", "#58a6ff"],
    bg: "#0d1117",
    bgDeep: "#080c12",
    bgSurface: "#161b22",
    border: "#21262d",
    borderSubtle: "#161b22",
    text: "#c9d1d9",
    textMuted: "#8b949e",
    textFaint: "#484f58",
    accent: "#58a6ff",
    accentBg: "#58a6ff20",
    heading: "#d2dae4",
    inputBg: "#0d1117",
    inputBorder: "#30363d",
    tagBg: "#1c2330",
    tagText: "#8bb0d0",
    urlColor: "#58a6ff",
    chipBorder: "#21262d",
    chipSelectedBg: "#1c2330",
    chipSelectedBorder: "#58a6ff",
    overlayBg: "#111820",
    hoverBg: "#171d28"
  }
};
var CHECKS = [
  { id: "frontmatter", label: "Frontmatter" },
  { id: "slug", label: "Slug" },
  { id: "links", label: "Links" },
  { id: "images", label: "Images" },
  { id: "build", label: "Build" }
];

// src/hooks/useHover.ts
function useHover() {
  const [hovered, setHovered] = d2(false);
  const handlers = T2(() => ({
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }), []);
  return [hovered, handlers];
}

// src/components/StatusPill.tsx
function StatusPill({ status, selected, onClick, t: t3 }) {
  const c3 = STATUS_CONFIG[status];
  const [hovered, hoverHandlers] = useHover();
  return /* @__PURE__ */ _(
    "button",
    {
      onClick,
      ...hoverHandlers,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 6,
        width: "100%",
        border: selected ? `1.5px solid ${c3.color}` : "1.5px solid transparent",
        background: selected ? c3.bg : hovered ? t3.hoverBg : "transparent",
        color: selected ? c3.color : hovered ? t3.text : t3.textFaint,
        cursor: "pointer",
        fontSize: 12.5,
        fontWeight: selected ? 600 : 400,
        transition: "all 0.2s ease",
        fontFamily: "inherit",
        justifyContent: "flex-start",
        transform: hovered && !selected ? "translateX(2px)" : "none"
      }
    },
    /* @__PURE__ */ _("span", { style: { fontSize: 11 } }, c3.icon),
    /* @__PURE__ */ _("span", null, c3.label),
    selected && /* @__PURE__ */ _("span", { style: { marginLeft: "auto", fontSize: 10.5, opacity: 0.7 } }, c3.desc)
  );
}

// src/components/ThemeChip.tsx
function ThemeChip({ themeId, selected, onClick, t: t3 }) {
  const palette = THEME_PALETTES[themeId];
  const [hovered, hoverHandlers] = useHover();
  return /* @__PURE__ */ _(
    "button",
    {
      onClick,
      ...hoverHandlers,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 6,
        border: selected ? `1.5px solid ${palette.chipSelectedBorder}` : `1.5px solid ${t3.chipBorder}`,
        background: selected ? palette.chipSelectedBg : hovered ? t3.hoverBg : "transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 11.5,
        color: selected ? t3.text : hovered ? t3.text : t3.textMuted,
        fontWeight: selected ? 600 : 400,
        transition: "all 0.2s ease",
        transform: hovered && !selected ? "translateY(-1px)" : "none"
      }
    },
    /* @__PURE__ */ _("span", { style: { display: "flex", gap: 2 } }, palette.dots.map((color, i3) => /* @__PURE__ */ _("span", { key: i3, style: {
      width: selected ? 10 : 8,
      height: selected ? 10 : 8,
      borderRadius: "50%",
      background: color,
      border: `1px solid ${t3.border}`,
      transition: "all 0.25s ease"
    } }))),
    palette.label
  );
}

// src/components/CheckBadge.tsx
function CheckBadge({ label, passed, running, justPassed }) {
  return /* @__PURE__ */ _(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 4,
        fontSize: 11,
        background: running ? "#e5c07b15" : passed ? "#98c37915" : "#e06c7515",
        color: running ? "#e5c07b" : passed ? "#98c379" : "#e06c75",
        border: `1px solid ${running ? "#e5c07b30" : passed ? "#98c37930" : "#e06c7530"}`,
        transition: "all 0.3s ease",
        animation: justPassed ? "checkPop 0.3s ease" : "none"
      }
    },
    /* @__PURE__ */ _("span", { style: {
      fontSize: 10,
      display: "inline-block",
      animation: running ? "spin 1s linear infinite" : "none"
    } }, running ? "\u27F3" : passed ? "\u2713" : "\u2717"),
    label
  );
}

// src/components/AnimatedSection.tsx
function AnimatedSection({ title, children, collapsible = false, defaultOpen = true, badge, t: t3 }) {
  const [open, setOpen] = d2(defaultOpen);
  const [contentHeight, setContentHeight] = d2("auto");
  const [animating, setAnimating] = d2(false);
  const contentRef = A2(null);
  const [hovered, hoverHandlers] = useHover();
  const toggle = () => {
    if (!collapsible)
      return;
    if (contentRef.current) {
      const h3 = contentRef.current.scrollHeight;
      if (open) {
        setContentHeight(h3 + "px");
        requestAnimationFrame(() => {
          setAnimating(true);
          setContentHeight("0px");
        });
        setTimeout(() => {
          setOpen(false);
          setAnimating(false);
        }, 200);
      } else {
        setOpen(true);
        setContentHeight("0px");
        requestAnimationFrame(() => {
          setAnimating(true);
          setContentHeight(h3 + "px");
        });
        setTimeout(() => {
          setContentHeight("auto");
          setAnimating(false);
        }, 200);
      }
    } else {
      setOpen(!open);
    }
  };
  return /* @__PURE__ */ _("div", { style: { marginBottom: 2 } }, /* @__PURE__ */ _(
    "button",
    {
      onClick: toggle,
      ...collapsible ? hoverHandlers : {},
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        padding: "8px 0",
        background: "none",
        border: "none",
        color: hovered && collapsible ? t3.text : t3.heading,
        fontSize: 10.5,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        cursor: collapsible ? "pointer" : "default",
        fontFamily: "inherit",
        transition: "color 0.2s ease"
      }
    },
    collapsible && /* @__PURE__ */ _("span", { style: {
      fontSize: 9,
      display: "inline-block",
      transition: "transform 0.2s ease",
      transform: open ? "rotate(90deg)" : "rotate(0deg)"
    } }, "\u25B6"),
    title,
    badge && /* @__PURE__ */ _("span", { style: { marginLeft: "auto" } }, badge)
  ), /* @__PURE__ */ _(
    "div",
    {
      ref: contentRef,
      style: {
        overflow: animating ? "hidden" : "visible",
        height: open && !animating ? "auto" : contentHeight,
        transition: animating ? "height 0.2s ease" : "none",
        opacity: open ? 1 : 0
      }
    },
    open && children
  ));
}

// src/components/FieldRow.tsx
function FieldRow({ label, children, t: t3 }) {
  return /* @__PURE__ */ _("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", fontSize: 12.5 } }, /* @__PURE__ */ _("span", { style: { color: t3.textMuted, flexShrink: 0, transition: "color 0.25s ease" } }, label), /* @__PURE__ */ _("span", { style: { color: t3.text, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%", transition: "color 0.25s ease" } }, children));
}

// src/components/TagInput.tsx
function TagInput({ tags, onChange, t: t3 }) {
  const [input, setInput] = d2("");
  return /* @__PURE__ */ _("div", null, /* @__PURE__ */ _("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: tags.length ? 6 : 0 } }, tags.map((tag) => /* @__PURE__ */ _("span", { key: tag, style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 4,
    background: t3.tagBg,
    color: t3.tagText,
    fontSize: 11,
    transition: "all 0.25s ease",
    animation: "tagIn 0.2s ease"
  } }, "#", tag, /* @__PURE__ */ _(
    "button",
    {
      onClick: () => onChange(tags.filter((x2) => x2 !== tag)),
      style: {
        background: "none",
        border: "none",
        color: t3.textFaint,
        cursor: "pointer",
        padding: 0,
        fontSize: 13,
        lineHeight: 1,
        fontFamily: "inherit",
        transition: "color 0.15s ease"
      }
    },
    "\xD7"
  )))), /* @__PURE__ */ _(
    "input",
    {
      value: input,
      onInput: (e3) => setInput(e3.target.value),
      onKeyDown: (e3) => {
        if (e3.key === "Enter") {
          e3.preventDefault();
          const val = input.trim().toLowerCase();
          if (val && !tags.includes(val))
            onChange([...tags, val]);
          setInput("");
        }
      },
      placeholder: "Add tag...",
      style: {
        width: "100%",
        padding: "5px 8px",
        borderRadius: 4,
        border: `1px solid ${t3.inputBorder}`,
        background: t3.inputBg,
        color: t3.text,
        fontSize: 12,
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
        transition: "all 0.25s ease"
      }
    }
  ));
}

// src/components/SlugEditor.tsx
function SlugEditor({ slug, onChange, t: t3 }) {
  const [editing, setEditing] = d2(false);
  const [value, setValue] = d2(slug);
  const [hovered, hoverHandlers] = useHover();
  y2(() => setValue(slug), [slug]);
  if (editing) {
    return /* @__PURE__ */ _(
      "input",
      {
        autoFocus: true,
        value,
        onInput: (e3) => setValue(e3.target.value.replace(/[^a-z0-9-]/g, "")),
        onBlur: () => {
          onChange(value);
          setEditing(false);
        },
        onKeyDown: (e3) => {
          if (e3.key === "Enter") {
            onChange(value);
            setEditing(false);
          }
        },
        style: {
          width: "100%",
          padding: "5px 8px",
          borderRadius: 4,
          border: `1px solid ${t3.accent}`,
          background: t3.inputBg,
          color: t3.text,
          fontSize: 12,
          outline: "none",
          fontFamily: "'SF Mono', monospace",
          boxSizing: "border-box",
          transition: "all 0.25s ease"
        }
      }
    );
  }
  return /* @__PURE__ */ _(
    "button",
    {
      onClick: () => setEditing(true),
      ...hoverHandlers,
      style: {
        background: "none",
        border: "none",
        fontSize: 11.5,
        cursor: "pointer",
        padding: 0,
        fontFamily: "'SF Mono', monospace",
        textAlign: "right",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        color: hovered ? t3.text : t3.accent,
        textDecoration: hovered ? "underline" : "none",
        transition: "all 0.15s ease"
      }
    },
    "/",
    slug
  );
}

// src/components/UrlPreview.tsx
function UrlPreview({ url, t: t3 }) {
  const [copied, setCopied] = d2(false);
  const [hovered, hoverHandlers] = useHover();
  const copy = () => {
    navigator.clipboard.writeText("https://" + url).catch(() => {
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return /* @__PURE__ */ _(
    "button",
    {
      onClick: copy,
      ...hoverHandlers,
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 10px",
        borderRadius: 6,
        background: hovered ? t3.hoverBg : t3.bgDeep,
        border: `1px solid ${hovered ? t3.accent + "60" : t3.border}`,
        fontSize: 11.5,
        fontFamily: "'SF Mono', Consolas, monospace",
        color: t3.textMuted,
        wordBreak: "break-all",
        lineHeight: 1.5,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxSizing: "border-box"
      }
    },
    copied ? /* @__PURE__ */ _("span", { style: { color: "#98c379", animation: "fadeScaleIn 0.15s ease" } }, "\u2713", " Copied to clipboard") : /* @__PURE__ */ _(k, null, /* @__PURE__ */ _("span", { style: { color: t3.textFaint } }, "https://"), /* @__PURE__ */ _("span", { style: { color: t3.urlColor, transition: "color 0.4s ease" } }, url), hovered && /* @__PURE__ */ _("span", { style: { color: t3.textFaint, marginLeft: 6, fontSize: 10 } }, "\u2398"))
  );
}

// src/components/ChangeRow.tsx
function ChangeRow({ change, t: t3 }) {
  if (change.from && change.to && !change.to.startsWith("+")) {
    return /* @__PURE__ */ _("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 11.5 } }, /* @__PURE__ */ _("span", { style: { color: t3.textMuted, width: 50, flexShrink: 0 } }, change.field, ":"), /* @__PURE__ */ _("span", { style: { color: "#e06c75" } }, change.from), /* @__PURE__ */ _("span", { style: { color: t3.textFaint } }, "\u2192"), /* @__PURE__ */ _("span", { style: { color: "#98c379" } }, change.to));
  }
  if (change.to) {
    return /* @__PURE__ */ _("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 11.5 } }, /* @__PURE__ */ _("span", { style: { color: t3.textMuted, width: 50, flexShrink: 0 } }, change.field, ":"), /* @__PURE__ */ _("span", { style: { color: "#98c379" } }, change.to));
  }
  return /* @__PURE__ */ _("div", { style: { display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 11.5 } }, /* @__PURE__ */ _("span", { style: { color: t3.textMuted, width: 50, flexShrink: 0 } }, change.field, ":"), /* @__PURE__ */ _("span", { style: { color: "#e06c75", textDecoration: "line-through" } }, change.from));
}

// src/components/ActionButton.tsx
function ActionButton({ post, saved, hasChanges, publishing, onPublish, t: t3 }) {
  const [hovered, hoverHandlers] = useHover();
  const isLive = saved.status === "publish" && !hasChanges;
  let label, bg, color, glow, onClick, disabled;
  if (publishing) {
    label = "Deploying";
    bg = "#98c379";
    color = "#1e1e1e";
    glow = false;
    onClick = null;
    disabled = true;
  } else if (isLive) {
    label = "Live \u2713";
    bg = t3.bgSurface;
    color = t3.textFaint;
    glow = false;
    onClick = null;
    disabled = true;
  } else if (hasChanges) {
    label = "Publish";
    bg = hovered ? "#88b86a" : "#98c379";
    color = "#1e1e1e";
    glow = true;
    onClick = onPublish;
    disabled = false;
  } else {
    label = "No changes";
    bg = t3.bgSurface;
    color = t3.textFaint;
    glow = false;
    onClick = null;
    disabled = true;
  }
  return /* @__PURE__ */ _(
    "button",
    {
      onClick: onClick || void 0,
      disabled,
      ...!disabled ? hoverHandlers : {},
      style: {
        position: "relative",
        width: "100%",
        padding: "10px 16px",
        borderRadius: 8,
        border: "none",
        background: bg,
        color,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        animation: glow && !publishing ? "pulseGlow 2s ease-in-out infinite" : "none",
        overflow: "hidden",
        transform: hovered && !disabled ? "translateY(-1px)" : "none"
      }
    },
    publishing && /* @__PURE__ */ _("span", { style: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      background: "rgba(255,255,255,0.2)",
      animation: "progressFill 2.8s ease-out forwards",
      borderRadius: 8
    } }),
    /* @__PURE__ */ _("span", { style: { position: "relative", zIndex: 1 } }, label)
  );
}

// src/components/ConfirmModal.tsx
function ConfirmButton({ label, onClick, bg, color, border }) {
  const [hovered, hoverHandlers] = useHover();
  return /* @__PURE__ */ _(
    "button",
    {
      onClick,
      ...hoverHandlers,
      style: {
        flex: 1,
        padding: "8px",
        borderRadius: 6,
        border: border ? `1px solid ${border}` : "none",
        background: bg,
        color,
        fontSize: 12,
        fontWeight: border ? 400 : 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "all 0.15s ease",
        filter: hovered ? "brightness(1.1)" : "none"
      }
    },
    label
  );
}
function ConfirmModal({ changes, hasChanges, onConfirm, onCancel, t: t3 }) {
  return /* @__PURE__ */ _("div", { style: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 10,
    animation: "overlayIn 0.2s ease forwards",
    background: "rgba(0,0,0,0.6)"
  } }, /* @__PURE__ */ _("div", { style: {
    background: t3.overlayBg,
    borderRadius: 10,
    padding: 20,
    width: "100%",
    border: `1px solid ${t3.border}`,
    animation: "modalIn 0.25s ease"
  } }, /* @__PURE__ */ _("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 8, color: t3.heading } }, "Publish changes?"), /* @__PURE__ */ _("div", { style: { fontSize: 12, color: t3.textMuted, marginBottom: 12, lineHeight: 1.5 } }, "This will run checks, update frontmatter, and trigger a Vercel deploy. Your build pipeline will handle the rest."), hasChanges && /* @__PURE__ */ _("div", { style: { padding: "8px 10px", borderRadius: 6, background: t3.bgDeep, border: `1px solid ${t3.border}`, marginBottom: 12 } }, /* @__PURE__ */ _("div", { style: { fontSize: 10, color: t3.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 } }, "Changes"), changes.map((c3, i3) => /* @__PURE__ */ _(ChangeRow, { key: i3, change: c3, t: t3 }))), /* @__PURE__ */ _("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ _(ConfirmButton, { label: "Cancel", onClick: onCancel, bg: "transparent", color: t3.textMuted, border: t3.border }), /* @__PURE__ */ _(ConfirmButton, { label: "Publish", onClick: onConfirm, bg: "#98c379", color: "#1e1e1e" }))));
}

// src/components/HoverButton.tsx
function HoverButton({ onClick, t: t3, children }) {
  const [hovered, hoverHandlers] = useHover();
  return /* @__PURE__ */ _(
    "button",
    {
      onClick,
      ...hoverHandlers,
      style: {
        padding: "5px 10px",
        borderRadius: 5,
        border: `1px solid ${hovered ? t3.accent + "60" : t3.border}`,
        background: hovered ? t3.hoverBg : "transparent",
        color: hovered ? t3.text : t3.textMuted,
        fontSize: 11,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s ease"
      }
    },
    children
  );
}

// src/components/DeployHistoryButton.tsx
function DeployHistoryButton({ onClick, t: t3 }) {
  const [hovered, hoverHandlers] = useHover();
  return /* @__PURE__ */ _(
    "button",
    {
      onClick,
      ...hoverHandlers,
      style: {
        width: "100%",
        padding: "8px 14px",
        background: hovered ? t3.hoverBg : "none",
        border: "none",
        borderTop: `1px solid ${t3.border}`,
        color: hovered ? t3.textMuted : t3.textFaint,
        fontSize: 11,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s ease"
      }
    },
    "Deploy history ",
    "\u25B8"
  );
}

// src/components/PublishPanel.tsx
function computeChanges(saved, current, savedTheme, currentTheme) {
  var _a, _b, _c, _d;
  const changes = [];
  if (saved.status !== current.status) {
    changes.push({
      field: "Status",
      from: ((_a = STATUS_CONFIG[saved.status]) == null ? void 0 : _a.label) || saved.status,
      to: ((_b = STATUS_CONFIG[current.status]) == null ? void 0 : _b.label) || current.status
    });
  }
  if (savedTheme !== currentTheme) {
    changes.push({
      field: "Theme",
      from: ((_c = THEME_PALETTES[savedTheme]) == null ? void 0 : _c.label) || savedTheme,
      to: ((_d = THEME_PALETTES[currentTheme]) == null ? void 0 : _d.label) || currentTheme
    });
  }
  if (saved.slug !== current.slug) {
    changes.push({ field: "Slug", from: saved.slug, to: current.slug });
  }
  const added = current.tags.filter((x2) => !saved.tags.includes(x2));
  const removed = saved.tags.filter((x2) => !current.tags.includes(x2));
  added.forEach((x2) => changes.push({ field: "Tags", from: null, to: `+#${x2}` }));
  removed.forEach((x2) => changes.push({ field: "Tags", from: `#${x2}`, to: null }));
  return changes;
}
function PublishPanel({
  post,
  saved,
  settings,
  onStatusChange,
  onThemeChange,
  onSlugChange,
  onTagsChange,
  onPublish,
  onUnpublish,
  onRunChecks,
  onOpenDeployHistory
}) {
  var _a, _b, _c;
  const [publishing, setPublishing] = d2(false);
  const [checks, setChecks] = d2({});
  const [justPassed, setJustPassed] = d2({});
  const [checksRunning, setChecksRunning] = d2(false);
  const [showConfirm, setShowConfirm] = d2(false);
  const [toast, setToast] = d2(null);
  const [toastExiting, setToastExiting] = d2(false);
  const [selectedTheme, setSelectedTheme] = d2(settings.themes[0] || "classic");
  const t3 = THEME_PALETTES[selectedTheme] || THEME_PALETTES.classic;
  const themes = T2(() => settings.themes, [settings.themes]);
  const changes = computeChanges(saved, post, settings.themes[0] || "classic", selectedTheme);
  const hasChanges = changes.length > 0;
  const allChecksPassed = CHECKS.every((c3) => checks[c3.id] === true);
  const readingTime = Math.max(1, Math.ceil(post.wordCount / 238));
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
  const siteUrl = `amishrobot.com/${((_a = post.date.match(/^(\d{4})/)) == null ? void 0 : _a[1]) || ""}/${post.slug}`;
  const showToast = q2((msg, color) => {
    setToastExiting(false);
    setToast({ msg, color });
    setTimeout(() => {
      setToastExiting(true);
      setTimeout(() => {
        setToast(null);
        setToastExiting(false);
      }, 200);
    }, 2500);
  }, []);
  const runChecks = q2(async () => {
    setChecks({});
    setJustPassed({});
    setChecksRunning(true);
    for (let i3 = 0; i3 < CHECKS.length; i3++) {
      const check = CHECKS[i3];
      setChecks((prev) => ({ ...prev, [check.id]: "running" }));
      await new Promise((r3) => setTimeout(r3, 150));
      const results = await onRunChecks();
      const result = results[check.id];
      setChecks((prev) => {
        var _a2;
        return { ...prev, [check.id]: (_a2 = result == null ? void 0 : result.passed) != null ? _a2 : false };
      });
      setJustPassed((prev) => {
        var _a2;
        return { ...prev, [check.id]: (_a2 = result == null ? void 0 : result.passed) != null ? _a2 : false };
      });
      setTimeout(() => setJustPassed((prev) => ({ ...prev, [check.id]: false })), 400);
    }
    setChecksRunning(false);
    showToast("All checks passed", "#98c379");
  }, [onRunChecks, showToast]);
  const handlePublish = () => {
    setShowConfirm(true);
  };
  const confirmAction = q2(async () => {
    var _a2, _b2;
    setShowConfirm(false);
    setChecks({});
    setJustPassed({});
    setChecksRunning(true);
    for (let i3 = 0; i3 < CHECKS.length; i3++) {
      const check = CHECKS[i3];
      setChecks((prev) => ({ ...prev, [check.id]: "running" }));
      await new Promise((r3) => setTimeout(r3, 150));
      const results = await onRunChecks();
      const result = results[check.id];
      const passed = (_a2 = result == null ? void 0 : result.passed) != null ? _a2 : false;
      setChecks((prev) => ({ ...prev, [check.id]: passed }));
      setJustPassed((prev) => ({ ...prev, [check.id]: passed }));
      setTimeout(() => setJustPassed((prev) => ({ ...prev, [check.id]: false })), 400);
      if (!passed) {
        setChecksRunning(false);
        showToast(`Check failed: ${check.label}`, "#e06c75");
        return;
      }
    }
    setChecksRunning(false);
    setPublishing(true);
    try {
      if (selectedTheme !== (settings.themes[0] || "classic")) {
        onThemeChange(selectedTheme);
      }
      await onPublish();
      const statusLabel = (((_b2 = STATUS_CONFIG[post.status]) == null ? void 0 : _b2.label) || "unknown").toLowerCase();
      const toastMsg = post.status === "publish" ? "Deploy triggered \u2014 post going live" : `Deploy triggered \u2014 status: ${statusLabel}`;
      showToast(toastMsg, "#98c379");
    } catch (e3) {
      showToast(`Publish failed: ${(e3 == null ? void 0 : e3.message) || e3}`, "#e06c75");
    } finally {
      setPublishing(false);
    }
  }, [onRunChecks, onPublish, onThemeChange, selectedTheme, settings.themes, post.status, showToast]);
  return /* @__PURE__ */ _("div", { style: {
    height: "100%",
    background: t3.bg,
    borderLeft: `1px solid ${t3.border}`,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: t3.text,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    position: "relative",
    transition: "background 0.4s ease, color 0.4s ease, border-color 0.4s ease"
  } }, /* @__PURE__ */ _("div", { style: {
    padding: "12px 14px",
    borderBottom: `1px solid ${t3.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    transition: "border-color 0.4s ease"
  } }, /* @__PURE__ */ _("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ _("span", { style: { fontSize: 14 } }, "\u{1F680}"), /* @__PURE__ */ _("span", { style: { fontSize: 13, fontWeight: 600, color: t3.heading, transition: "color 0.4s ease" } }, "Publish")), /* @__PURE__ */ _("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 8px",
    borderRadius: 4,
    background: statusConfig.bg,
    border: `1px solid ${statusConfig.color}40`,
    transition: "all 0.25s ease"
  } }, /* @__PURE__ */ _("span", { style: { fontSize: 8, color: statusConfig.color } }, statusConfig.icon), /* @__PURE__ */ _("span", { style: { fontSize: 10.5, color: statusConfig.color, fontWeight: 500 } }, statusConfig.label))), /* @__PURE__ */ _("div", { style: { flex: 1, overflowY: "auto", padding: "8px 14px 14px" } }, /* @__PURE__ */ _("div", { style: { padding: "8px 0 12px" } }, /* @__PURE__ */ _("div", { style: { fontSize: 14, fontWeight: 600, color: t3.heading, lineHeight: 1.35, transition: "color 0.4s ease" } }, post.title), /* @__PURE__ */ _("div", { style: { fontSize: 11, color: t3.textFaint, marginTop: 4, transition: "color 0.4s ease" } }, post.wordCount, " words ", "\xB7", " ", readingTime, " min read ", "\xB7", " ", post.type)), /* @__PURE__ */ _(AnimatedSection, { title: "Status", t: t3 }, /* @__PURE__ */ _("div", { style: { display: "flex", flexDirection: "column", gap: 3 } }, Object.keys(STATUS_CONFIG).map((s3) => /* @__PURE__ */ _(StatusPill, { key: s3, status: s3, selected: post.status === s3, onClick: () => onStatusChange(s3), t: t3 })))), /* @__PURE__ */ _("div", { style: { height: 1, background: t3.border, margin: "8px 0", transition: "background 0.4s ease" } }), /* @__PURE__ */ _(AnimatedSection, { title: "Theme", t: t3 }, /* @__PURE__ */ _("div", { style: { marginBottom: 6 } }, /* @__PURE__ */ _(FieldRow, { label: "Live theme", t: t3 }, /* @__PURE__ */ _("span", { style: {
    textTransform: "capitalize",
    color: selectedTheme !== (settings.themes[0] || "classic") ? "#e5c07b" : t3.text,
    transition: "color 0.25s ease"
  } }, ((_b = THEME_PALETTES[settings.themes[0] || "classic"]) == null ? void 0 : _b.label) || "Classic", selectedTheme !== (settings.themes[0] || "classic") && ` \u2192 ${((_c = THEME_PALETTES[selectedTheme]) == null ? void 0 : _c.label) || selectedTheme}`))), /* @__PURE__ */ _("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, themes.map((id) => /* @__PURE__ */ _(ThemeChip, { key: id, themeId: id, selected: selectedTheme === id, onClick: () => setSelectedTheme(id), t: t3 })))), /* @__PURE__ */ _("div", { style: { height: 1, background: t3.border, margin: "8px 0", transition: "background 0.4s ease" } }), /* @__PURE__ */ _(AnimatedSection, { title: "Checks", t: t3, badge: allChecksPassed && !checksRunning ? /* @__PURE__ */ _("span", { style: { fontSize: 10, color: "#98c379", fontWeight: 400, textTransform: "none", letterSpacing: "0" } }, "All passed") : null }, /* @__PURE__ */ _("div", { style: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 } }, CHECKS.map((c3) => /* @__PURE__ */ _(CheckBadge, { key: c3.id, label: c3.label, passed: checks[c3.id] === true, running: checks[c3.id] === "running", justPassed: justPassed[c3.id] || false }))), !checksRunning && !allChecksPassed && /* @__PURE__ */ _(HoverButton, { onClick: runChecks, t: t3 }, "Run checks")), /* @__PURE__ */ _("div", { style: { height: 1, background: t3.border, margin: "8px 0", transition: "background 0.4s ease" } }), /* @__PURE__ */ _(AnimatedSection, { title: "Metadata", collapsible: true, defaultOpen: true, t: t3 }, /* @__PURE__ */ _(FieldRow, { label: "Date", t: t3 }, new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })), /* @__PURE__ */ _(FieldRow, { label: "Type", t: t3 }, /* @__PURE__ */ _("span", { style: { textTransform: "capitalize" } }, post.type)), /* @__PURE__ */ _(FieldRow, { label: "Modified", t: t3 }, new Date(post.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })), /* @__PURE__ */ _("div", { style: { padding: "5px 0" } }, /* @__PURE__ */ _("div", { style: { color: t3.textMuted, fontSize: 12.5, marginBottom: 4, transition: "color 0.25s ease" } }, "Slug"), /* @__PURE__ */ _(SlugEditor, { slug: post.slug, onChange: onSlugChange, t: t3 }))), /* @__PURE__ */ _("div", { style: { height: 1, background: t3.border, margin: "8px 0", transition: "background 0.4s ease" } }), /* @__PURE__ */ _(AnimatedSection, { title: "Tags", collapsible: true, defaultOpen: true, t: t3 }, /* @__PURE__ */ _(TagInput, { tags: post.tags, onChange: onTagsChange, t: t3 })), /* @__PURE__ */ _("div", { style: { height: 1, background: t3.border, margin: "8px 0", transition: "background 0.4s ease" } }), /* @__PURE__ */ _(AnimatedSection, { title: "URL Preview", collapsible: true, defaultOpen: true, t: t3 }, /* @__PURE__ */ _(UrlPreview, { url: siteUrl, t: t3 })), /* @__PURE__ */ _("div", { style: { height: 1, background: t3.border, margin: "8px 0", transition: "background 0.4s ease" } }), /* @__PURE__ */ _(AnimatedSection, { title: "Changes", collapsible: true, defaultOpen: true, t: t3, badge: hasChanges ? /* @__PURE__ */ _("span", { style: { fontSize: 10, color: "#e5c07b", fontWeight: 400, textTransform: "none", letterSpacing: "0" } }, changes.length) : null }, hasChanges ? /* @__PURE__ */ _("div", { style: { padding: "4px 0" } }, changes.map((c3, i3) => /* @__PURE__ */ _(ChangeRow, { key: i3, change: c3, t: t3 }))) : /* @__PURE__ */ _("div", { style: { fontSize: 11.5, color: t3.textFaint, padding: "4px 0", fontStyle: "italic" } }, "No changes"))), /* @__PURE__ */ _("div", { style: { flexShrink: 0 } }, /* @__PURE__ */ _("div", { style: { padding: "10px 14px", borderTop: `1px solid ${t3.border}`, transition: "border-color 0.4s ease" } }, /* @__PURE__ */ _(
    ActionButton,
    {
      post,
      saved,
      hasChanges,
      publishing,
      onPublish: handlePublish,
      t: t3
    }
  )), /* @__PURE__ */ _(DeployHistoryButton, { onClick: onOpenDeployHistory, t: t3 })), showConfirm && /* @__PURE__ */ _(
    ConfirmModal,
    {
      changes,
      hasChanges,
      onConfirm: confirmAction,
      onCancel: () => setShowConfirm(false),
      t: t3
    }
  ), toast && /* @__PURE__ */ _("div", { style: {
    position: "absolute",
    bottom: 100,
    left: 14,
    right: 14,
    padding: "10px 14px",
    borderRadius: 8,
    background: `${toast.color}15`,
    border: `1px solid ${toast.color}30`,
    fontSize: 12,
    color: toast.color,
    zIndex: 5,
    animation: toastExiting ? "slideOut 0.2s ease forwards" : "slideUp 0.2s ease"
  } }, toast.msg));
}

// src/PublishView.tsx
var VIEW_TYPE_BLOG_PUBLISHER = "blog-publisher-view";
var PublishView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.savedStates = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_BLOG_PUBLISHER;
  }
  getDisplayText() {
    return "Publish";
  }
  getIcon() {
    return "rocket";
  }
  async onOpen() {
    await this.refresh();
  }
  async onClose() {
    const container = this.containerEl.children[1];
    G(null, container);
  }
  async refresh() {
    const file = this.app.workspace.getActiveFile();
    const container = this.containerEl.children[1];
    if (!file || !this.isPostFile(file)) {
      container.empty();
      container.innerHTML = '<div style="padding:20px;color:#888;font-size:13px;">Open a blog post to see publishing controls.</div>';
      return;
    }
    const post = await this.buildPostState(file);
    if (!this.savedStates.has(file.path)) {
      this.savedStates.set(file.path, { ...post });
    }
    const saved = this.savedStates.get(file.path);
    const settings = this.plugin.settings;
    G(
      _(PublishPanel, {
        post,
        saved,
        settings,
        onStatusChange: (status) => this.handleStatusChange(file, status),
        onThemeChange: (theme) => this.handleThemeChange(theme),
        onSlugChange: (slug) => this.handleSlugChange(file, slug),
        onTagsChange: (tags) => this.handleTagsChange(file, tags),
        onPublish: () => this.handlePublish(file),
        onUnpublish: () => this.handleUnpublish(file),
        onRunChecks: () => this.handleRunChecks(file),
        onOpenDeployHistory: () => this.handleOpenDeployHistory()
      }),
      container
    );
  }
  isPostFile(file) {
    const folder = this.plugin.settings.postsFolder.replace(/\/$/, "");
    return file.path.startsWith(folder + "/") && file.path.endsWith(".md");
  }
  async buildPostState(file) {
    const content = await this.app.vault.read(file);
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? (0, import_obsidian.parseYaml)(fmMatch[1]) || {} : {};
    const body = fmMatch ? content.slice(fmMatch[0].length) : content;
    const wordCount = body.split(/\s+/).filter((w3) => w3.length > 0).length;
    return {
      title: String(fm.title || file.basename),
      slug: String(fm.slug || ""),
      date: String(fm.date || ""),
      status: String(fm.status || "draft"),
      type: String(fm.type || "post"),
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      wordCount,
      lastModified: new Date(file.stat.mtime).toISOString(),
      publishedHash: String(fm.publishedHash || ""),
      publishedCommit: String(fm.publishedCommit || ""),
      publishedAt: String(fm.publishedAt || "")
    };
  }
  async handleStatusChange(file, status) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = status;
    });
    await this.refresh();
  }
  async handleThemeChange(theme) {
    const themeFile = this.app.vault.getAbstractFileByPath(this.plugin.settings.themeFilePath);
    if (themeFile instanceof import_obsidian.TFile) {
      await this.app.vault.modify(themeFile, `---
theme: ${theme}
---
`);
    }
    await this.refresh();
  }
  async handleSlugChange(file, slug) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.slug = slug;
    });
    await this.refresh();
  }
  async handleTagsChange(file, tags) {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.tags = tags;
    });
    await this.refresh();
  }
  async handlePublish(file) {
    await this.plugin.publishFile(file);
    const newState = await this.buildPostState(file);
    this.savedStates.set(file.path, { ...newState });
    await this.refresh();
  }
  async handleUnpublish(file) {
    await this.plugin.unpublishFile(file);
    const newState = await this.buildPostState(file);
    this.savedStates.set(file.path, { ...newState });
    await this.refresh();
  }
  async handleRunChecks(file) {
    return this.plugin.checksService.runAll(file);
  }
  handleOpenDeployHistory() {
    const repo = this.plugin.settings.repository;
    const url = `https://github.com/${repo}/commits/main`;
    window.open(url);
  }
};

// src/services/PostService.ts
var import_obsidian2 = require("obsidian");
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "bmp"]);
var PostService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  async buildPostData(file) {
    const content = await this.app.vault.read(file);
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? (0, import_obsidian2.parseYaml)(fmMatch[1]) || {} : {};
    if (!fm.title)
      throw new Error("Missing required frontmatter: title");
    if (!fm.date)
      throw new Error("Missing required frontmatter: date");
    if (!fm.slug)
      throw new Error("Missing required frontmatter: slug");
    const title = String(fm.title);
    const date = String(fm.date);
    const slug = this.normalizeSlug(String(fm.slug));
    const yearMatch = date.match(/^(\d{4})/);
    if (!yearMatch)
      throw new Error(`Invalid date format: ${date}`);
    const year = yearMatch[1];
    const images = await this.resolveImages(content, year, slug);
    const transformedMarkdown = this.rewriteImageLinks(content, images, year, slug);
    const publishedHash = await this.computeHash(transformedMarkdown, images);
    const repoPostPath = `content/posts/${year}/${slug}.md`;
    return {
      title,
      date,
      year,
      slug,
      repoPostPath,
      transformedMarkdown,
      images,
      publishedHash
    };
  }
  normalizeSlug(slug) {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  async resolveImages(content, year, slug) {
    var _a;
    const images = [];
    const usedFilenames = /* @__PURE__ */ new Set();
    const re = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
    let match;
    while ((match = re.exec(content)) !== null) {
      const linkTarget = match[1].trim();
      const ext = ((_a = linkTarget.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
      if (!IMAGE_EXTENSIONS.has(ext))
        continue;
      const resolved = this.app.metadataCache.getFirstLinkpathDest(linkTarget, "");
      if (!resolved) {
        throw new Error(`Image not found in vault: ${linkTarget}`);
      }
      let filename = resolved.name;
      if (usedFilenames.has(filename.toLowerCase())) {
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
        const fileExt = filename.substring(filename.lastIndexOf("."));
        let counter = 2;
        while (usedFilenames.has(`${nameWithoutExt}-${counter}${fileExt}`.toLowerCase())) {
          counter++;
        }
        filename = `${nameWithoutExt}-${counter}${fileExt}`;
      }
      usedFilenames.add(filename.toLowerCase());
      images.push({
        vaultPath: resolved.path,
        filename,
        repoPath: `public/_assets/images/${year}/${slug}/${filename}`,
        originalWikilink: match[0]
      });
    }
    return images;
  }
  rewriteImageLinks(content, images, year, slug) {
    var _a;
    let result = content;
    for (const img of images) {
      const altMatch = img.originalWikilink.match(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/);
      const alt = ((_a = altMatch == null ? void 0 : altMatch[2]) == null ? void 0 : _a.trim()) || "";
      const mdImage = `![${alt}](/_assets/images/${year}/${slug}/${img.filename})`;
      result = result.replaceAll(img.originalWikilink, mdImage);
    }
    return result;
  }
  async computeHash(transformedMarkdown, images) {
    const parts = [transformedMarkdown];
    const imageHashes = [];
    for (const img of images) {
      const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
      if (file instanceof import_obsidian2.TFile) {
        const data = await this.app.vault.readBinary(file);
        const hash = await this.hashArrayBuffer(data);
        imageHashes.push(`${img.filename}:${hash}`);
      }
    }
    imageHashes.sort();
    parts.push(...imageHashes);
    const combined = parts.join("\n");
    const encoder = new TextEncoder();
    const encoded = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async hashArrayBuffer(buffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
};

// src/services/GitHubService.ts
var import_obsidian3 = require("obsidian");
var GitHubService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
    const parts = settings.repository.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Invalid repository format. Must be "owner/repo"');
    }
    this.owner = parts[0];
    this.repo = parts[1];
  }
  async publish(postData) {
    const blobs = await this.createBlobs(postData);
    const commitSha = await this.withRefRetry(
      (headSha, treeSha) => this.createCommitAndUpdateRef(
        blobs,
        treeSha,
        headSha,
        `Publish: ${postData.title}`
      )
    );
    const postUrl = `${this.settings.siteUrl}/${postData.year}/${postData.slug}`;
    return { commitSha, postUrl };
  }
  async unpublish(filePaths, title) {
    const deletions = filePaths.map((path) => ({
      path,
      mode: "100644",
      type: "blob",
      sha: null
    }));
    return this.withRefRetry(
      (headSha, treeSha) => this.deleteAndUpdateRef(deletions, treeSha, headSha, title)
    );
  }
  async publishTextFile(repoPath, content, message) {
    const blob = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      { content, encoding: "utf-8" }
    );
    const blobs = [
      {
        path: repoPath,
        sha: blob.sha,
        mode: "100644",
        type: "blob"
      }
    ];
    return this.withRefRetry(
      (headSha, treeSha) => this.createCommitAndUpdateRef(blobs, treeSha, headSha, message)
    );
  }
  async fileContentEquals(repoPath, expectedContent) {
    try {
      const encodedPath = repoPath.split("/").map((part) => encodeURIComponent(part)).join("/");
      const resp = await this.apiGet(
        `/repos/${this.owner}/${this.repo}/contents/${encodedPath}?ref=${this.settings.branch}`
      );
      const contentBase64 = String(resp.content || "").replace(/\n/g, "");
      const actualContent = atob(contentBase64);
      return actualContent === expectedContent;
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      throw error;
    }
  }
  // ── Internal methods ──────────────────────────────────────────────
  async deleteAndUpdateRef(deletions, baseTreeSha, parentCommitSha, title) {
    const tree = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      { base_tree: baseTreeSha, tree: deletions }
    );
    const commit = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message: `Unpublish: ${title}`,
        tree: tree.sha,
        parents: [parentCommitSha]
      }
    );
    await this.apiPatch(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
      { sha: commit.sha }
    );
    return commit.sha;
  }
  async getHeadSha() {
    const resp = await this.apiGet(
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${this.settings.branch}`
    );
    return resp.object.sha;
  }
  async getTreeSha(commitSha) {
    const resp = await this.apiGet(
      `/repos/${this.owner}/${this.repo}/git/commits/${commitSha}`
    );
    return resp.tree.sha;
  }
  async createBlobs(postData) {
    const blobs = [];
    const mdBlob = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      { content: postData.transformedMarkdown, encoding: "utf-8" }
    );
    blobs.push({
      path: postData.repoPostPath,
      sha: mdBlob.sha,
      mode: "100644",
      type: "blob"
    });
    for (const img of postData.images) {
      const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
      if (!(file instanceof import_obsidian3.TFile)) {
        throw new Error(`Image file not found: ${img.vaultPath}`);
      }
      const binary = await this.app.vault.readBinary(file);
      const base64 = this.arrayBufferToBase64(binary);
      const imgBlob = await this.apiPost(
        `/repos/${this.owner}/${this.repo}/git/blobs`,
        { content: base64, encoding: "base64" }
      );
      blobs.push({
        path: img.repoPath,
        sha: imgBlob.sha,
        mode: "100644",
        type: "blob"
      });
    }
    return blobs;
  }
  async createCommitAndUpdateRef(blobs, baseTreeSha, parentCommitSha, message) {
    const tree = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      { base_tree: baseTreeSha, tree: blobs }
    );
    const commit = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message,
        tree: tree.sha,
        parents: [parentCommitSha]
      }
    );
    await this.apiPatch(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
      { sha: commit.sha }
    );
    return commit.sha;
  }
  async withRefRetry(operation) {
    const maxAttempts = 5;
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const headSha = await this.getHeadSha();
      const treeSha = await this.getTreeSha(headSha);
      try {
        return await operation(headSha, treeSha);
      } catch (error) {
        lastError = error;
        if (!this.shouldRetryRefUpdate(error) || attempt === maxAttempts) {
          throw error;
        }
        await this.sleep(attempt * 250);
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }
  shouldRetryRefUpdate(error) {
    if (!(error instanceof Error))
      return false;
    return error.message.includes("409") || error.message.includes("422") || error.message.includes("Reference update failed") || error.message.includes("Update is not a fast forward");
  }
  // ── HTTP helpers ──────────────────────────────────────────────────
  headers() {
    return {
      Authorization: `Bearer ${this.settings.githubToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async apiRequest(method, path, body) {
    var _a;
    const url = `https://api.github.com${path}`;
    try {
      const resp = await (0, import_obsidian3.requestUrl)({
        url,
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : void 0
      });
      return resp.json;
    } catch (e3) {
      const status = (e3 == null ? void 0 : e3.status) || "unknown";
      let detail = "";
      try {
        detail = JSON.stringify(((_a = e3 == null ? void 0 : e3.response) == null ? void 0 : _a.json) || (e3 == null ? void 0 : e3.message) || e3);
      } catch (e4) {
        detail = String(e3);
      }
      throw new Error(`GitHub ${status} on ${method} ${path}: ${detail}`);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async apiGet(path) {
    return this.apiRequest("GET", path);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async apiPost(path, body) {
    return this.apiRequest("POST", path, body);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async apiPatch(path, body) {
    return this.apiRequest("PATCH", path, body);
  }
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i3 = 0; i3 < bytes.byteLength; i3++) {
      binary += String.fromCharCode(bytes[i3]);
    }
    return btoa(binary);
  }
  async sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/services/ChecksService.ts
var IMAGE_EXTENSIONS2 = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "bmp"]);
var ChecksService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  async checkFrontmatter(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!(cache == null ? void 0 : cache.frontmatter)) {
      return { passed: false, message: "No frontmatter found" };
    }
    const fm = cache.frontmatter;
    const missing = [];
    if (!fm.title)
      missing.push("title");
    if (!fm.date)
      missing.push("date");
    if (!fm.slug)
      missing.push("slug");
    if (missing.length > 0) {
      return { passed: false, message: `Missing: ${missing.join(", ")}` };
    }
    return { passed: true };
  }
  async checkSlug(file) {
    var _a;
    const cache = this.app.metadataCache.getFileCache(file);
    const slug = String(((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.slug) || "");
    if (!slug)
      return { passed: false, message: "No slug" };
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { passed: false, message: "Invalid characters in slug" };
    }
    if (slug.startsWith("-") || slug.endsWith("-")) {
      return { passed: false, message: "Slug cannot start or end with hyphen" };
    }
    return { passed: true };
  }
  async checkLinks(file) {
    var _a;
    const content = await this.app.vault.read(file);
    const linkRe = /\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
    let match;
    const broken = [];
    while ((match = linkRe.exec(content)) !== null) {
      const target = match[1].trim();
      const ext = ((_a = target.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
      if (IMAGE_EXTENSIONS2.has(ext))
        continue;
      const resolved = this.app.metadataCache.getFirstLinkpathDest(target, file.path);
      if (!resolved)
        broken.push(target);
    }
    if (broken.length > 0) {
      return { passed: false, message: `Broken: ${broken.slice(0, 3).join(", ")}` };
    }
    return { passed: true };
  }
  async checkImages(file) {
    var _a;
    const content = await this.app.vault.read(file);
    const imageRe = /!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
    let match;
    const missing = [];
    while ((match = imageRe.exec(content)) !== null) {
      const target = match[1].trim();
      const ext = ((_a = target.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
      if (!IMAGE_EXTENSIONS2.has(ext))
        continue;
      const resolved = this.app.metadataCache.getFirstLinkpathDest(target, "");
      if (!resolved)
        missing.push(target);
    }
    if (missing.length > 0) {
      return { passed: false, message: `Missing: ${missing.slice(0, 3).join(", ")}` };
    }
    return { passed: true };
  }
  async checkBuild(_file) {
    return { passed: true };
  }
  async runAll(file) {
    return {
      frontmatter: await this.checkFrontmatter(file),
      slug: await this.checkSlug(file),
      links: await this.checkLinks(file),
      images: await this.checkImages(file),
      build: await this.checkBuild(file)
    };
  }
};

// src/services/ConfigService.ts
var import_obsidian4 = require("obsidian");
var STATE_FILE_PATH = "_state/blog-config.md";
var ConfigService = class {
  constructor(app) {
    this.app = app;
  }
  async loadFromStateFile() {
    const file = this.app.vault.getAbstractFileByPath(STATE_FILE_PATH);
    if (!(file instanceof import_obsidian4.TFile))
      return null;
    const content = await this.app.vault.read(file);
    return this.parseStateFile(content);
  }
  parseStateFile(content) {
    const settings = {};
    const body = content.replace(/^---\n[\s\S]*?\n---\n?/, "");
    const lines = body.split("\n");
    let currentKey = null;
    let listValues = [];
    for (const line of lines) {
      if (line.startsWith("#") || line.trim() === "") {
        if (currentKey && listValues.length > 0) {
          this.setListValue(settings, currentKey, listValues);
          currentKey = null;
          listValues = [];
        }
        continue;
      }
      const listMatch = line.match(/^\s+-\s+(.+)/);
      if (listMatch && currentKey) {
        listValues.push(listMatch[1].trim());
        continue;
      }
      const kvMatch = line.match(/^(\w+):\s*(.*)/);
      if (kvMatch) {
        if (currentKey && listValues.length > 0) {
          this.setListValue(settings, currentKey, listValues);
          listValues = [];
        }
        const key = kvMatch[1];
        const value = kvMatch[2].trim();
        if (value === "") {
          currentKey = key;
        } else {
          this.setStringValue(settings, key, value);
          currentKey = null;
        }
      }
    }
    if (currentKey && listValues.length > 0) {
      this.setListValue(settings, currentKey, listValues);
    }
    return settings;
  }
  setStringValue(settings, key, value) {
    const validKeys = [
      "githubToken",
      "repository",
      "branch",
      "postsFolder",
      "themeFilePath",
      "themeRepoPath",
      "siteUrl"
    ];
    if (validKeys.includes(key)) {
      settings[key] = value;
    }
  }
  setListValue(settings, key, values) {
    if (key === "themes") {
      settings.themes = values;
    }
  }
  merge(pluginSettings, stateOverrides) {
    if (!stateOverrides)
      return pluginSettings;
    return { ...pluginSettings, ...stateOverrides };
  }
};

// src/SettingsTab.ts
var import_obsidian5 = require("obsidian");
var SettingsTab = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian5.Setting(containerEl).setName("GitHub token").setDesc("Fine-grained personal access token with contents:write scope").addText(
      (text) => text.setPlaceholder("github_pat_...").setValue(this.plugin.settings.githubToken).then((t3) => t3.inputEl.type = "password").onChange(async (value) => {
        this.plugin.settings.githubToken = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Repository").setDesc("GitHub repository (owner/repo)").addText(
      (text) => text.setPlaceholder("amishrobot/amishrobot.com").setValue(this.plugin.settings.repository).onChange(async (value) => {
        this.plugin.settings.repository = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Branch").setDesc("Target branch for commits").addText(
      (text) => text.setPlaceholder("main").setValue(this.plugin.settings.branch).onChange(async (value) => {
        this.plugin.settings.branch = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Posts folder").setDesc("Vault folder to watch for posts").addText(
      (text) => text.setPlaceholder("Personal/Blog/posts").setValue(this.plugin.settings.postsFolder).onChange(async (value) => {
        this.plugin.settings.postsFolder = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Theme settings file").setDesc("Vault markdown file to publish when theme settings change").addText(
      (text) => text.setPlaceholder("Personal/Blog/settings/theme.md").setValue(this.plugin.settings.themeFilePath).onChange(async (value) => {
        this.plugin.settings.themeFilePath = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Theme repo path").setDesc("Path in GitHub repo for committed theme settings").addText(
      (text) => text.setPlaceholder("content/settings/theme.md").setValue(this.plugin.settings.themeRepoPath).onChange(async (value) => {
        this.plugin.settings.themeRepoPath = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Site URL").setDesc("Blog URL for success notice links").addText(
      (text) => text.setPlaceholder("https://amishrobot.com").setValue(this.plugin.settings.siteUrl).onChange(async (value) => {
        this.plugin.settings.siteUrl = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian5.Setting(containerEl).setName("Themes").setDesc("Comma-separated list of theme IDs (e.g., classic,paper,spruce,midnight)").addText(
      (text) => text.setPlaceholder("classic,paper,spruce,midnight").setValue(this.plugin.settings.themes.join(",")).onChange(async (value) => {
        this.plugin.settings.themes = value.split(",").map((s3) => s3.trim()).filter((s3) => s3.length > 0);
        await this.plugin.saveSettings();
      })
    );
  }
};

// src/main.ts
var BlogPublisherPlugin = class extends import_obsidian6.Plugin {
  async onload() {
    console.log("Loading Blog Publisher v2");
    await this.loadSettings();
    this.checksService = new ChecksService(this.app, this.settings);
    this.registerView(
      VIEW_TYPE_BLOG_PUBLISHER,
      (leaf) => new PublishView(leaf, this)
    );
    this.addRibbonIcon("rocket", "Blog Publisher", () => {
      this.activateView();
    });
    this.addCommand({
      id: "open-blog-publisher",
      name: "Open Blog Publisher",
      callback: () => this.activateView()
    });
    this.addCommand({
      id: "publish-current-post",
      name: "Publish Current Post",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !this.isPostFile(file))
          return false;
        if (!checking)
          this.publishFile(file);
        return true;
      }
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.refreshView();
      })
    );
    let modifyTimeout = null;
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (!(file instanceof import_obsidian6.TFile) || !this.isPostFile(file))
          return;
        if (modifyTimeout)
          clearTimeout(modifyTimeout);
        modifyTimeout = setTimeout(() => this.refreshView(), 500);
      })
    );
    this.addSettingTab(new SettingsTab(this.app, this));
  }
  async onunload() {
    console.log("Unloading Blog Publisher v2");
  }
  isPostFile(file) {
    const folder = this.settings.postsFolder.replace(/\/$/, "");
    return file.path.startsWith(folder + "/") && file.path.endsWith(".md");
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_BLOG_PUBLISHER);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_BLOG_PUBLISHER,
          active: true
        });
      }
    }
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }
  refreshView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BLOG_PUBLISHER);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view == null ? void 0 : view.refresh)
        view.refresh();
    }
  }
  // ── Publishing methods (called by PublishView) ──────────────────
  async publishFile(file) {
    const postService = new PostService(this.app, this.settings);
    const postData = await postService.buildPostData(file);
    const githubService = new GitHubService(this.app, this.settings);
    const result = await githubService.publish(postData);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.publishedAt = (/* @__PURE__ */ new Date()).toISOString();
      fm.publishedCommit = result.commitSha;
      fm.publishedHash = postData.publishedHash;
    });
  }
  async unpublishFile(file) {
    const postService = new PostService(this.app, this.settings);
    const postData = await postService.buildPostData(file);
    const filePaths = [postData.repoPostPath, ...postData.images.map((img) => img.repoPath)];
    const githubService = new GitHubService(this.app, this.settings);
    await githubService.unpublish(filePaths, postData.title);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      delete fm.publishedAt;
      delete fm.publishedCommit;
      delete fm.publishedHash;
    });
  }
  // ── Settings ────────────────────────────────────────────────────
  async loadSettings() {
    this.configService = new ConfigService(this.app);
    const pluginData = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    const stateOverrides = await this.configService.loadFromStateFile();
    this.settings = this.configService.merge(pluginData, stateOverrides);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
