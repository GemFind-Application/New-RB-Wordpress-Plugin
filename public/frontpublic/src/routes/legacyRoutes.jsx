import { Navigate, useParams } from "react-router-dom";
import Settings from "../pages/settings";
import Diamond from "../pages/diamond";
import Compare from "../pages/compare";
import Complete from "../pages/complete";

/**
 * ringBuilder-old: /settings/style|shape|metal/{value} → Settings query params.
 */
export function LegacySettingsFilterRedirect({ queryKey }) {
  const params = useParams();
  const raw =
    queryKey === "ring_collection"
      ? params.styleValue
      : queryKey === "selected_shape"
        ? params.shapeValue
        : params.metalValue;
  const value = encodeURIComponent(String(raw ?? ""));
  return <Navigate to={`/settings?${queryKey}=${value}`} replace />;
}

/**
 * ringBuilder-old: /settings/islabsettings/1 (listing) or /settings/islabsettings/{product-slug}.
 */
export function LegacyLabSettingsRoute(props) {
  const { settingSlug } = useParams();
  if (settingSlug === "1") {
    return <Settings {...props} isLabGrown={true} />;
  }
  return (
    <Navigate
      to={`/settings/product/${encodeURIComponent(String(settingSlug ?? ""))}`}
      replace
    />
  );
}

/**
 * Routes from ringBuilder-old that are not covered by the primary React Router table.
 */
export function buildLegacyRoutes(ctx) {
  const diamondNav = (isLabGrown) => (
    <Diamond
      additionOptionSetting={ctx.additionOptionSetting}
      configAppData={ctx.configAppData}
      addCompareDiamondIds={ctx.addCompareDiamondIds}
      compareDiamondsId={ctx.compareDiamondsId}
      onCompareContainerClick={ctx.onCompareContainerClick}
      isLabGrown={isLabGrown}
      setIsLabGrown={ctx.setIsLabGrown}
      setShowLoading={ctx.setShowLoading}
      removeCompareDiamondIds={ctx.removeCompareDiamondIds}
      setCompareDiamondsId={ctx.setCompareDiamondsId}
    />
  );

  const compare = (
    <Compare
      isLabGrown={ctx.isLabGrown}
      configAppData={ctx.configAppData}
      removeCompareDiamondIds={ctx.removeCompareDiamondIds}
      compareDiamondsId={ctx.compareDiamondsId}
      setShowLoading={ctx.setShowLoading}
    />
  );

  const complete = (
    <Complete
      shopUrl={ctx.shopUrl}
      isLabGrown={ctx.isLabGrown}
      additionOptionSetting={ctx.additionOptionSetting}
      formSetting={ctx.additionOptionSetting}
      configAppData={ctx.configAppData}
      setShowLoading={ctx.setShowLoading}
    />
  );

  return [
    { path: "/settings/style/:styleValue", element: <LegacySettingsFilterRedirect queryKey="ring_collection" /> },
    { path: "/settings/shape/:shapeValue", element: <LegacySettingsFilterRedirect queryKey="selected_shape" /> },
    { path: "/settings/metal/:metalValue", element: <LegacySettingsFilterRedirect queryKey="ring_metal" /> },

    { path: "/diamondlink/navstandard", element: diamondNav(false) },
    { path: "/diamondlink/diamondtype/navstandard", element: diamondNav(false) },
    { path: "/diamondlink/diamondtype/navlabgrown", element: diamondNav(true) },
    { path: "/diamondlink/diamondtype/navfancycolored", element: diamondNav("fancy") },
    { path: "/diamondlink/compare", element: compare },
    { path: "/diamondlink/completering", element: complete },

    { path: "/diamondtools/navstandard", element: diamondNav(false) },
    { path: "/diamondtools/diamondtype/navstandard", element: diamondNav(false) },
    { path: "/diamondtools/diamondtype/navlabgrown", element: diamondNav(true) },
    { path: "/diamondtools/diamondtype/navfancycolored", element: diamondNav("fancy") },
    { path: "/diamondtools/compare", element: compare },
    { path: "/diamondtools/completering", element: complete },
  ];
}
