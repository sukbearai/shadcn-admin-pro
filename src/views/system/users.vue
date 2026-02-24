<template>
  <div class="p-5">
    <Card class="border-border/60 bg-card/70">
      <CardHeader class="space-y-2">
        <CardTitle>用户管理（管理员权限）</CardTitle>
        <CardDescription>当前页面用于演示路由权限与按钮权限控制。</CardDescription>
      </CardHeader>

      <CardContent>
        <div class="rounded-lg border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="item in users" :key="item.id">
                <TableCell>{{ item.id }}</TableCell>
                <TableCell>{{ item.name }}</TableCell>
                <TableCell>
                  <Badge :variant="item.role === 'admin' ? 'default' : 'secondary'">{{ item.role }}</Badge>
                </TableCell>
                <TableCell class="space-x-2">
                  <Button v-permission='["admin"]' size="sm" variant="outline">编辑</Button>
                  <Button v-permission='["admin"]' size="sm" variant="destructive">删除</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const users = [
  { id: 1, name: "admin", role: "admin" },
  { id: 2, name: "user", role: "user" },
]
</script>
