import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ShoppingBag, Plus, DollarSign, Package } from "lucide-react";
import { db } from "@/lib/db";
import { profiles, products } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const productList = await db
    .select()
    .from(products)
    .where(eq(products.profileId, profile.id))
    .orderBy(desc(products.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your digital and physical products.
          </p>
        </div>
        <Button className="cursor-pointer min-h-11 gap-2" disabled>
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {productList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-base font-medium text-foreground">
              No products yet
            </h3>
            <p className="mt-1 max-w-xs text-center text-sm text-muted-foreground">
              Add Product blocks to your page to start selling digital downloads,
              merch, and more.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productList.map((product) => (
            <Card key={product.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground line-clamp-1">
                      {product.title}
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={product.status === "active" ? "default" : "secondary"}
                    className="ml-2 capitalize"
                  >
                    {product.status}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {Number(product.price).toFixed(2)} {product.currency.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    {product.inventorySold} sold
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
