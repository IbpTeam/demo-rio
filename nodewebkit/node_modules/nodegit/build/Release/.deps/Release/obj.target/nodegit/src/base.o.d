cmd_Release/obj.target/nodegit/src/base.o := g++ '-D_LARGEFILE_SOURCE' '-D_FILE_OFFSET_BITS=64' '-DBUILDING_NODE_EXTENSION' -I/home/v1/.node-gyp/0.10.29/src -I/home/v1/.node-gyp/0.10.29/deps/uv/include -I/home/v1/.node-gyp/0.10.29/deps/v8/include -I../vendor/libv8-convert -I../vendor/libgit2/include -I../node_modules/nan  -Wall -Wextra -Wno-unused-parameter -pthread -m32 -Wall -O2 -fno-strict-aliasing -fno-tree-vrp -fno-omit-frame-pointer -fno-rtti -fno-exceptions -MMD -MF ./Release/.deps/Release/obj.target/nodegit/src/base.o.d.raw  -c -o Release/obj.target/nodegit/src/base.o ../src/base.cc
Release/obj.target/nodegit/src/base.o: ../src/base.cc \
 /home/v1/.node-gyp/0.10.29/deps/v8/include/v8.h \
 /home/v1/.node-gyp/0.10.29/deps/v8/include/v8stdint.h \
 /home/v1/.node-gyp/0.10.29/src/node.h \
 /home/v1/.node-gyp/0.10.29/deps/uv/include/uv.h \
 /home/v1/.node-gyp/0.10.29/deps/uv/include/uv-private/uv-unix.h \
 /home/v1/.node-gyp/0.10.29/deps/uv/include/uv-private/ngx-queue.h \
 /home/v1/.node-gyp/0.10.29/deps/uv/include/uv-private/uv-linux.h \
 /home/v1/.node-gyp/0.10.29/src/node_object_wrap.h \
 /home/v1/.node-gyp/0.10.29/src/node.h ../vendor/libgit2/include/git2.h \
 ../vendor/libgit2/include/git2/version.h \
 ../vendor/libgit2/include/git2/common.h \
 ../vendor/libgit2/include/git2/threads.h \
 ../vendor/libgit2/include/git2/common.h \
 ../vendor/libgit2/include/git2/errors.h \
 ../vendor/libgit2/include/git2/types.h \
 ../vendor/libgit2/include/git2/oid.h \
 ../vendor/libgit2/include/git2/types.h \
 ../vendor/libgit2/include/git2/signature.h \
 ../vendor/libgit2/include/git2/odb.h \
 ../vendor/libgit2/include/git2/oid.h \
 ../vendor/libgit2/include/git2/odb_backend.h \
 ../vendor/libgit2/include/git2/indexer.h \
 ../vendor/libgit2/include/git2/repository.h \
 ../vendor/libgit2/include/git2/revwalk.h \
 ../vendor/libgit2/include/git2/merge.h \
 ../vendor/libgit2/include/git2/graph.h \
 ../vendor/libgit2/include/git2/refs.h \
 ../vendor/libgit2/include/git2/strarray.h \
 ../vendor/libgit2/include/git2/reflog.h \
 ../vendor/libgit2/include/git2/revparse.h \
 ../vendor/libgit2/include/git2/object.h \
 ../vendor/libgit2/include/git2/blob.h \
 ../vendor/libgit2/include/git2/object.h \
 ../vendor/libgit2/include/git2/commit.h \
 ../vendor/libgit2/include/git2/tag.h \
 ../vendor/libgit2/include/git2/tree.h \
 ../vendor/libgit2/include/git2/diff.h \
 ../vendor/libgit2/include/git2/tree.h \
 ../vendor/libgit2/include/git2/refs.h \
 ../vendor/libgit2/include/git2/index.h \
 ../vendor/libgit2/include/git2/config.h \
 ../vendor/libgit2/include/git2/transport.h \
 ../vendor/libgit2/include/git2/net.h \
 ../vendor/libgit2/include/git2/remote.h \
 ../vendor/libgit2/include/git2/repository.h \
 ../vendor/libgit2/include/git2/refspec.h \
 ../vendor/libgit2/include/git2/transport.h \
 ../vendor/libgit2/include/git2/clone.h \
 ../vendor/libgit2/include/git2/checkout.h \
 ../vendor/libgit2/include/git2/diff.h \
 ../vendor/libgit2/include/git2/remote.h \
 ../vendor/libgit2/include/git2/checkout.h \
 ../vendor/libgit2/include/git2/push.h \
 ../vendor/libgit2/include/git2/attr.h \
 ../vendor/libgit2/include/git2/ignore.h \
 ../vendor/libgit2/include/git2/branch.h \
 ../vendor/libgit2/include/git2/refspec.h \
 ../vendor/libgit2/include/git2/net.h \
 ../vendor/libgit2/include/git2/status.h \
 ../vendor/libgit2/include/git2/indexer.h \
 ../vendor/libgit2/include/git2/submodule.h \
 ../vendor/libgit2/include/git2/notes.h \
 ../vendor/libgit2/include/git2/reset.h \
 ../vendor/libgit2/include/git2/message.h \
 ../vendor/libgit2/include/git2/pack.h \
 ../vendor/libgit2/include/git2/stash.h ../src/../include/wrapper.h \
 ../node_modules/nan/nan.h /home/v1/.node-gyp/0.10.29/src/node_buffer.h \
 /home/v1/.node-gyp/0.10.29/src/node_version.h \
 /home/v1/.node-gyp/0.10.29/src/node_object_wrap.h \
 ../src/../include/reference.h ../src/../include/signature.h \
 ../src/../include/time.h ../src/../include/blob.h \
 ../src/../include/repo.h ../src/../include/oid.h \
 ../src/../include/object.h ../src/../include/commit.h \
 ../src/../include/revwalk.h ../src/../include/tree.h \
 ../src/../include/tree_entry.h ../src/../include/diff_find_options.h \
 ../src/../include/diff_options.h ../src/../include/diff_list.h \
 ../src/../include/diff_range.h ../src/../include/diff_file.h \
 ../src/../include/patch.h ../src/../include/delta.h \
 ../src/../include/threads.h ../src/../include/index.h \
 ../src/../include/index_entry.h ../src/../include/index_time.h \
 ../src/../include/tag.h ../src/../include/refdb.h \
 ../src/../include/odb_object.h ../src/../include/odb.h \
 ../src/../include/submodule.h ../src/../include/tree_builder.h \
 ../src/../include/remote.h ../src/../include/clone_options.h
../src/base.cc:
/home/v1/.node-gyp/0.10.29/deps/v8/include/v8.h:
/home/v1/.node-gyp/0.10.29/deps/v8/include/v8stdint.h:
/home/v1/.node-gyp/0.10.29/src/node.h:
/home/v1/.node-gyp/0.10.29/deps/uv/include/uv.h:
/home/v1/.node-gyp/0.10.29/deps/uv/include/uv-private/uv-unix.h:
/home/v1/.node-gyp/0.10.29/deps/uv/include/uv-private/ngx-queue.h:
/home/v1/.node-gyp/0.10.29/deps/uv/include/uv-private/uv-linux.h:
/home/v1/.node-gyp/0.10.29/src/node_object_wrap.h:
/home/v1/.node-gyp/0.10.29/src/node.h:
../vendor/libgit2/include/git2.h:
../vendor/libgit2/include/git2/version.h:
../vendor/libgit2/include/git2/common.h:
../vendor/libgit2/include/git2/threads.h:
../vendor/libgit2/include/git2/common.h:
../vendor/libgit2/include/git2/errors.h:
../vendor/libgit2/include/git2/types.h:
../vendor/libgit2/include/git2/oid.h:
../vendor/libgit2/include/git2/types.h:
../vendor/libgit2/include/git2/signature.h:
../vendor/libgit2/include/git2/odb.h:
../vendor/libgit2/include/git2/oid.h:
../vendor/libgit2/include/git2/odb_backend.h:
../vendor/libgit2/include/git2/indexer.h:
../vendor/libgit2/include/git2/repository.h:
../vendor/libgit2/include/git2/revwalk.h:
../vendor/libgit2/include/git2/merge.h:
../vendor/libgit2/include/git2/graph.h:
../vendor/libgit2/include/git2/refs.h:
../vendor/libgit2/include/git2/strarray.h:
../vendor/libgit2/include/git2/reflog.h:
../vendor/libgit2/include/git2/revparse.h:
../vendor/libgit2/include/git2/object.h:
../vendor/libgit2/include/git2/blob.h:
../vendor/libgit2/include/git2/object.h:
../vendor/libgit2/include/git2/commit.h:
../vendor/libgit2/include/git2/tag.h:
../vendor/libgit2/include/git2/tree.h:
../vendor/libgit2/include/git2/diff.h:
../vendor/libgit2/include/git2/tree.h:
../vendor/libgit2/include/git2/refs.h:
../vendor/libgit2/include/git2/index.h:
../vendor/libgit2/include/git2/config.h:
../vendor/libgit2/include/git2/transport.h:
../vendor/libgit2/include/git2/net.h:
../vendor/libgit2/include/git2/remote.h:
../vendor/libgit2/include/git2/repository.h:
../vendor/libgit2/include/git2/refspec.h:
../vendor/libgit2/include/git2/transport.h:
../vendor/libgit2/include/git2/clone.h:
../vendor/libgit2/include/git2/checkout.h:
../vendor/libgit2/include/git2/diff.h:
../vendor/libgit2/include/git2/remote.h:
../vendor/libgit2/include/git2/checkout.h:
../vendor/libgit2/include/git2/push.h:
../vendor/libgit2/include/git2/attr.h:
../vendor/libgit2/include/git2/ignore.h:
../vendor/libgit2/include/git2/branch.h:
../vendor/libgit2/include/git2/refspec.h:
../vendor/libgit2/include/git2/net.h:
../vendor/libgit2/include/git2/status.h:
../vendor/libgit2/include/git2/indexer.h:
../vendor/libgit2/include/git2/submodule.h:
../vendor/libgit2/include/git2/notes.h:
../vendor/libgit2/include/git2/reset.h:
../vendor/libgit2/include/git2/message.h:
../vendor/libgit2/include/git2/pack.h:
../vendor/libgit2/include/git2/stash.h:
../src/../include/wrapper.h:
../node_modules/nan/nan.h:
/home/v1/.node-gyp/0.10.29/src/node_buffer.h:
/home/v1/.node-gyp/0.10.29/src/node_version.h:
/home/v1/.node-gyp/0.10.29/src/node_object_wrap.h:
../src/../include/reference.h:
../src/../include/signature.h:
../src/../include/time.h:
../src/../include/blob.h:
../src/../include/repo.h:
../src/../include/oid.h:
../src/../include/object.h:
../src/../include/commit.h:
../src/../include/revwalk.h:
../src/../include/tree.h:
../src/../include/tree_entry.h:
../src/../include/diff_find_options.h:
../src/../include/diff_options.h:
../src/../include/diff_list.h:
../src/../include/diff_range.h:
../src/../include/diff_file.h:
../src/../include/patch.h:
../src/../include/delta.h:
../src/../include/threads.h:
../src/../include/index.h:
../src/../include/index_entry.h:
../src/../include/index_time.h:
../src/../include/tag.h:
../src/../include/refdb.h:
../src/../include/odb_object.h:
../src/../include/odb.h:
../src/../include/submodule.h:
../src/../include/tree_builder.h:
../src/../include/remote.h:
../src/../include/clone_options.h:
