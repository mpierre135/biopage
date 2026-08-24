import { eq } from "drizzle-orm";
import { ShoppingBag, Plus } from "lucide-react";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles, products } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProductsPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const productList = profile
    ? await db
        .select()
        .from(products)
        .where(eq(products.profileId, profile.id))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your digital and physical products.
          </p>
        </div>
        <Button className="cursor-pointer gap-2 min-h-[44px]">
          <Plus className="size-4" />
          Create Product
        </Button>
      </div>

      {productList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="size-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-900">
              No products yet
            </p>
            <p className="mt-1 max-w-sm text-center text-sm text-slate-500">
              Create your first product to start selling directly from your bio
              page.
            </p>
            <Button className="mt-4 cursor-pointer gap-2 min-h-[44px]">
              <Plus className="size-4" />
              Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.thumbnail ? (
                <div className="h-40 w-full bg-slate-100">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center bg-slate-50">
                  <ShoppingBag className="size-10 text-slate-300" />
                </div>
              )}
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {product.title}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {Number(product.price).toLocaleString("en-US", {
                        style: "currency",
                        currency: product.currency.toUpperCase(),
                      })}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      product.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {product.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
