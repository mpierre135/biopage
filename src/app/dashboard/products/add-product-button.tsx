"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProduct } from "@/lib/actions/products";

export function AddProductButton({
  profileId,
  canSell,
}: {
  profileId: string;
  canSell: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("9.99");

  if (!canSell) {
    return (
      <Button className="cursor-pointer min-h-11 gap-2" disabled title="Upgrade to Pro">
        <Plus className="h-4 w-4" />
        Add Product
      </Button>
    );
  }

  function submit() {
    startTransition(async () => {
      const result = await createProduct(profileId, {
        title,
        description,
        price,
      });
      if (result.success) {
        toast.success("Product created");
        setOpen(false);
        setTitle("");
        setDescription("");
        setPrice("9.99");
      } else {
        toast.error(result.error ?? "Failed to create product");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="cursor-pointer min-h-11 gap-2" />}
      >
        <Plus className="h-4 w-4" />
        Add Product
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="product-title">Title</Label>
            <Input
              id="product-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-desc">Description</Label>
            <Textarea
              id="product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Price (USD)</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="min-h-11"
            />
          </div>
          <Button
            className="min-h-11 w-full cursor-pointer"
            onClick={submit}
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
